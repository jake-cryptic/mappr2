import imghdr, uuid
from os import path, makedirs, remove
from flask import Blueprint, request, render_template, current_app, abort, send_from_directory, send_file
from flask_login import current_user, login_required
from sqlalchemy import func
from werkzeug.utils import secure_filename
from ..functions import resp, is_valid_uuid
from .. import limiter, db, mongo
from ..models import GalleryFile
from .forms import UpdateImageDetailsForm

gallery_bp = Blueprint("gallery_bp", __name__, template_folder="templates", url_prefix='/collections')

# Create file upload directories if they don't exist
if not path.exists(current_app.config['GALLERY_FILES_DEST']):
	makedirs(current_app.config['GALLERY_FILES_DEST'])


def validate_image(stream):
	header = stream.read(512)
	stream.seek(0)
	format = imghdr.what(None, header)
	if not format:
		return None
	return format if format != 'jpeg' else 'jpg'


@gallery_bp.route('/', methods=['GET'])
@login_required
def home():
	featured_images = GalleryFile.query.filter(
		GalleryFile.processing != 1,
		GalleryFile.permission < 2
	).order_by(func.random()).limit(10).all()
	user_images = GalleryFile.query.filter(
		GalleryFile.user_id == current_user.get_id(),
		GalleryFile.processing != 1
	).limit(10).all()

	return render_template('gallery/home.html', featured_image_list=featured_images, user_image_list=user_images)


@gallery_bp.route('/images/table', methods=['GET'])
@login_required
def image_table():
	user_images = GalleryFile.query.filter(
		GalleryFile.user_id == current_user.get_id()
	).all()
	return render_template('gallery/table.html', image_list=user_images)


@gallery_bp.route('/images/map', methods=['GET'])
@login_required
def image_map():
	user_images = GalleryFile.query.filter(
		GalleryFile.user_id == current_user.get_id()
	).all()
	#return render_template('gallery/map.html', image_list=user_images)
	return abort(501)


@gallery_bp.route('/upload', methods=['GET'])
@login_required
def upload():
	return render_template('gallery/upload.html')


@gallery_bp.route('/upload', methods=['POST'])
@limiter.limit('100/hour;60/minute;10/second')
@login_required
def image_upload():
	if len(request.files) == 0:
		return resp({}, error='Cannot process this request')

	def upload_file(file):
		if not file:
			return False

		if file.filename == '' or '.' not in file.filename:
			return False

		# file_ext = path.splitext(file.filename)[1].lower()
		file_ext = file.filename.rsplit('.', 1)[1].lower()
		if file_ext not in current_app.config['GALLERY_UPLOAD_EXTENSIONS']:
			return False

		file_type = validate_image(file.stream)
		if file_type != file_ext:
			return False

		new_name = secure_filename(file.filename)
		random_name = str(uuid.uuid4())
		random_reference = str(uuid.uuid4())

		description = None
		if 'description' in request.form:
			description = request.form['description']

		alt = None
		if 'alt' in request.form:
			alt = request.form['alt']

		# Add file to database
		db.session.add(GalleryFile(
			user_id=current_user.get_id(),
			description=description,
			alt_text=alt,
			file_name=new_name,
			file_location=random_name,
			file_uuid=random_reference,
			file_type=file_type
		))

		# Save file to server
		file_path = path.join(current_app.config['GALLERY_FILES_DEST'], random_name)
		file.save(file_path)

		# Commit database changes so that secondary thread can change file status
		db.session.commit()

		current_app.imageprocessor.send([random_reference, file_path])

		return True

	saved_files = {}
	for file_index in request.files:
		file = request.files[file_index]

		save_result = upload_file(file)
		if not save_result:
			return abort(400)

		saved_files[file.filename] = True

	# Check if we actually saved any files
	if len(saved_files) == 0:
		return resp({}, error='No files saved')

	return resp({
		'files': saved_files
	})


@gallery_bp.route('/image/delete/<image_uuid>', methods=['GET', 'POST'])
@limiter.limit('250/hour;50/minute;2/second')
def delete_image(image_uuid=None):
	if not is_valid_uuid(image_uuid):
		return abort(404)

	image_data = GalleryFile.query.filter(
		GalleryFile.file_uuid == image_uuid
	)
	if image_data.count() != 1:
		return abort(404)

	image_info = image_data.one()

	# Delete files associated with image (main and converted)
	file_loc = str(image_info.file_location)
	try:
		remove(path.join(current_app.config['GALLERY_FILES_DEST'], file_loc))
		remove(path.join(current_app.config['GALLERY_FILES_DEST'], file_loc + '.jpg'))
		remove(path.join(current_app.config['GALLERY_FILES_DEST'], file_loc + '.webp'))
	except FileNotFoundError:
		pass
	except OSError as err:
		return abort(500, err=err)

	# Delete mongodb data
	result = mongo.db.gallery_files.delete_one({'file_uuid': str(image_info.file_uuid)})
	print(result.deleted_count)

	# Remove record from SQL db
	db.session.delete(image_info)
	db.session.commit()

	return render_template('gallery/deleted.html')


@gallery_bp.route('/image/details/<image_uuid>', methods=['GET', 'POST'])
@limiter.limit('250/hour;50/minute;2/second')
def edit_image(image_uuid=None):
	if not is_valid_uuid(image_uuid):
		return abort(404)

	image_data = GalleryFile.query.filter(
		GalleryFile.file_uuid == image_uuid
	)
	if image_data.count() != 1:
		return abort(404)

	image_info = image_data.one()

	# Check permission to view the image
	if image_info.permission > 0:
		if not current_user.is_authenticated:
			return abort(404)
		elif image_info.permission > 1 and current_user.get_id() != image_info.user_id:
			return abort(403)

	exif_data = mongo.db.gallery_files.find_one({'file_uuid': str(image_info.file_uuid)})
	if exif_data is None:
		return abort(404)

	# Get exif tags
	tags = {}
	for key in exif_data['tags']:
		tags[key] = exif_data['tags'][key]

	# Get location
	location = []
	if 'lat' in exif_data:
		location = [exif_data['lat'], exif_data['lng']]

	update_form = UpdateImageDetailsForm()
	if request.method == 'POST' and update_form.validate_on_submit():
		# TODO: Process form
		return abort(501)

	return render_template('gallery/image.html', image=image_info, form=update_form, exif_data=tags, location=location)


@gallery_bp.route('/image/view/<image_uuid>/<image_format>', methods=['GET'])
@limiter.limit('250/hour;100/minute;10/second')
def view_image(image_uuid=None, image_format='best'):
	directory = path.join('..' + path.sep + current_app.config['GALLERY_FILES_DEST'])

	if not is_valid_uuid(image_uuid):
		return abort(404)

	if image_format != 'jpg':
		if request.accept_mimetypes['image/webp']:
			image_format = 'webp'
		else:
			image_format = 'jpg'

	image_data = GalleryFile.query.filter(
		GalleryFile.file_uuid == image_uuid
	)
	if image_data.count() != 1:
		return abort(404)

	image_info = image_data.one()

	# If image isn't done processing yet...
	if image_info.processing == 1:
		return abort(403)

	# Check permission to view the image
	if image_info.permission > 0:
		if not current_user.is_authenticated:
			return abort(404)
		elif image_info.permission > 1 and current_user.get_id() != image_info.user_id:
			return abort(403)

	file_ext = '.webp' if image_format != 'jpg' else '.jpg'

	try:
		return send_from_directory(
			directory, str(image_info.file_location) + file_ext,
			as_attachment=False,
			download_name=image_info.file_name,
			mimetype='image/' + image_format,
			last_modified=image_info.time_created,
			max_age=86400*365
		)
	except FileNotFoundError:
		return abort(404)
