import uuid
import imghdr
from os import path, makedirs
from flask import Blueprint, request, render_template, current_app, abort, send_from_directory, send_file
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from ..functions import resp
from .. import limiter, db
from ..models import GalleryFile

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


def is_valid_uuid(uuid_to_test, version=4):
	try:
		uuid_obj = uuid.UUID(uuid_to_test, version=version)
	except ValueError:
		return False
	return str(uuid_obj) == uuid_to_test


@gallery_bp.route('/', methods=['GET'])
@login_required
def home():
	featured_images = GalleryFile.query.limit(10).all()
	user_images = GalleryFile.query.filter_by(
		GalleryFile.user_id == current_user.get_id()
	).all()
	print(featured_images)
	print(featured_images)

	return render_template('gallery/home.html', featured_image_list=featured_images, user_image_list=user_images)


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

	print(request.form)

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

		# Add file to database
		db.session.add(GalleryFile(
			user_id=current_user.get_id(),
			file_name=new_name,
			file_location=random_name,
			file_uuid=random_reference,
			file_type=file_type
		))

		# Save file to server
		file_path = path.join(current_app.config['GALLERY_FILES_DEST'], random_name)
		file.save(file_path)

		current_app.imageprocessor.send(file_path)

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

	db.session.commit()

	return resp({
		'files': saved_files
	})


@gallery_bp.route('/image/<image_uuid>/<image_format>', methods=['GET'])
@limiter.limit('250/hour;100/minute;10/second')
def view_image(image_uuid=None, image_format='jpg'):
	directory = path.join('..' + path.sep + current_app.config['GALLERY_FILES_DEST'])

	if not is_valid_uuid(image_uuid):
		return abort(404)

	image_data = GalleryFile.query.filter(
		GalleryFile.file_uuid == image_uuid
	)
	if image_data.count() != 1:
		abort(404)

	image_info = image_data.one()
	file_ext = '.webp' if image_format != 'jpg' else '.jpg'

	try:
		return send_from_directory(
			directory, str(image_info.file_location) + file_ext,
			as_attachment=False,
			download_name=image_info.file_name,
			mimetype='image/' + image_info.file_type,
			last_modified=image_info.time_created,
			max_age=86400*365
		)
	except FileNotFoundError:
		abort(404)
