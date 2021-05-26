import threading, exifread
from queue import Queue
from time import sleep
from PIL import Image
from .. import mongo, db
from ..models import GalleryFile


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
				else:
					db_file = db_file_query.one()
					db_file.processing = 0
					db.session.commit()

				print(mongo.db)

			self.input_queue.task_done()
			sleep(1)

		# Done
		self.input_queue.task_done()
		return
