import threading, exifread
from queue import Queue
from time import sleep
from PIL import Image
from .. import mongo, db
from ..models import GalleryFile


# Thanks: https://stackoverflow.com/a/45857824/12286336
# https://gist.github.com/snakeye/fdc372dbf11370fe29eb
def _convert_to_degress(value):
	def zf(n):
		if n == 0:
			return 1
		else:
			return n
	d = float(value.values[0].num) / float(zf(value.values[0].den))
	m = float(value.values[1].num) / float(zf(value.values[1].den))
	s = float(value.values[2].num) / float(zf(value.values[2].den))
	return d + (m / 60.0) + (s / 3600.0)


def get_gps(tags):
	latitude = tags.get('GPS GPSLatitude')
	latitude_ref = tags.get('GPS GPSLatitudeRef')
	longitude = tags.get('GPS GPSLongitude')
	longitude_ref = tags.get('GPS GPSLongitudeRef')

	if not latitude or not longitude:
		return {}

	lat_value = _convert_to_degress(latitude)
	if latitude_ref.values != 'N':
		lat_value = -lat_value

	lon_value = _convert_to_degress(longitude)
	if longitude_ref.values != 'E':
		lon_value = -lon_value

	return {'latitude': lat_value, 'longitude': lon_value}


def get_mongo_schema(reference, tags):
	schema = {
		'file_uuid': reference,
		'tags': {}
	}

	# Get image GPS coords
	image_gps = get_gps(tags)
	if 'latitude' in image_gps:
		schema['lat'] = image_gps['latitude']
		schema['lng'] = image_gps['longitude']

	# Store remaining tags
	for key in tags:
		if isinstance(tags[key].values, list):
			val = tags[key].values
			if len(val) == 1:
				val = val[0]

				# MongoDB cannot insert this type
				if val.__class__.__name__ == 'Ratio':
					val = str(val)
			else:
				fixed_list = []
				for item in val:
					# MongoDB cannot insert this type
					if item.__class__.__name__ == 'Ratio':
						fixed_list.append(str(item))
					else:
						fixed_list.append(item)
				val = fixed_list

			schema['tags'][key] = val
		elif isinstance(tags[key].values, str):
			schema['tags'][key] = str(tags[key].values).strip()
		else:
			schema['tags'][key] = tags[key].values

	return schema


def correct_image_orientation(im, tags):
	if "Image Orientation" not in tags.keys():
		return im

	orientation = tags["Image Orientation"]
	val = orientation.values

	if 5 in val:
		val += [4, 8]
	if 7 in val:
		val += [4, 6]
	if 3 in val:
		im = im.transpose(Image.ROTATE_180)
	if 4 in val:
		im = im.transpose(Image.FLIP_TOP_BOTTOM)
	if 6 in val:
		print("Rotating by 270 degrees.")
		im = im.transpose(Image.ROTATE_270)
	if 8 in val:
		im = im.transpose(Image.ROTATE_90)

	return im


class ImageProcessorThread(threading.Thread):
	def __init__(self, *args, **kwargs):
		threading.Thread.__init__(self, *args, **kwargs)
		self.input_queue = Queue()

	def set_app(self, app):
		self.current_app = app

	def send(self, item):
		self.input_queue.put(item)

	def close(self):
		self.input_queue.put(None)
		self.input_queue.join()

	def run(self):
		while True:
			reference, im_file = self.input_queue.get()
			if im_file is None:
				break

			# Read EXIF data from image
			tags = {}
			try:
				with open(im_file, 'rb') as f:
					tags = exifread.process_file(f, details=False)
			except OSError:
				print('Could not read exif data')

			# Process the image here
			try:
				with Image.open(im_file) as im:
					print(im_file, im.format, im.size, im.mode)

					f_im = correct_image_orientation(im, tags)
					f_im.save(im_file + '.jpg', 'JPEG', quality=70, progressive=True)
					f_im.save(im_file + '.webp', 'WEBP', lossless=False, method=6, quality=80)
			except OSError:
				print("Could not convert file", im_file)

			with self.current_app.app_context():
				db_file_query = GalleryFile.query.filter(
					GalleryFile.file_uuid == reference
				)
				if db_file_query.count() != 1:
					print('Database update error')
					self.input_queue.task_done()
					continue

				schema = get_mongo_schema(reference, tags)
				try:
					mongo.db.gallery_files.insert_one(schema)
				except Exception as e:
					print('Mongo update error')
					print(e)
					self.input_queue.task_done()
					continue

				# Save changes to SQL db to indicate processing done
				db_file = db_file_query.one()
				db_file.processing = 0
				db.session.commit()

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
