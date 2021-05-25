import csv, uuid
from os import path, makedirs
from flask import Blueprint, render_template, current_app, request, abort
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from .. import limiter, db
from ..functions import resp, is_valid_uuid
from ..models import MapFile
from ..api.routes import api_get_map_area, api_get_mnc_list, api_get_sector_list

map_bp = Blueprint("map_bp", __name__, template_folder="templates", url_prefix='/map')

# Create file upload directories if they don't exist
if not path.exists(current_app.config['MAP_FILES_DEST']):
	makedirs(current_app.config['MAP_FILES_DEST'])


# TODO: Remove this temp fix after 2021/07/01
@map_bp.route('/api/map', methods=['GET'])
def map_api_get_map_area():
	return api_get_map_area()


@map_bp.route('/api/get-mccs', methods=['GET'])
def map_api_get_mnc_list():
	return api_get_mnc_list


@map_bp.route('/get-sectors', methods=['GET'])
def map_api_get_sector_list():
	return api_get_sector_list


@map_bp.route('/', methods=['GET'])
@login_required
def mappr():
	return render_template('map/map.html')


@map_bp.route('/beta', methods=['GET'])
@login_required
def mappr2():
	return render_template('map/mappr.html')


@map_bp.route('/files', methods=['GET'])
@login_required
def file_table():
	user_files = MapFile.query.filter(
		MapFile.user_id == current_user.get_id()
	).all()

	return render_template('map/file_table.html', file_list=user_files)


@map_bp.route('/files/delete/<image_uuid>', methods=['GET'])
@limiter.limit('250/hour;50/minute;2/second')
def file_delete(file_uuid=None):
	if not is_valid_uuid(file_uuid):
		return abort(404)

	file_data = MapFile.query.filter(
		MapFile.file_uuid == file_uuid
	)
	if file_data.count() != 1:
		return abort(404)

	file_info = file_data.one()

	return abort(501)


@map_bp.route('/files/details/<image_uuid>', methods=['GET'])
@limiter.limit('250/hour;50/minute;2/second')
def file_details(file_uuid=None):
	if not is_valid_uuid(file_uuid):
		return abort(404)

	file_data = MapFile.query.filter(
		MapFile.file_uuid == file_uuid
	)
	if file_data.count() != 1:
		return abort(404)

	file_info = file_data.one()

	#return render_template('gallery/image.html', file=file_info)
	return abort(501)


@map_bp.route('/files/upload', methods=['GET'])
@login_required
def files():
	return render_template('map/files.html')


@map_bp.route('/files/upload', methods=['POST'])
@limiter.limit('50/hour;10/minute;5/second')
@login_required
def file_upload():
	if len(request.files) != 1:
		return resp({}, error='Cannot process this request')

	def upload_file(file):
		if not file:
			return False

		if file.filename == '' or '.' not in file.filename:
			return False

		file_ext = file.filename.rsplit('.', 1)[1].lower()
		if file_ext not in current_app.config['MAP_UPLOAD_EXTENSIONS']:
			return False

		new_name = secure_filename(file.filename)
		random_name = str(uuid.uuid4())
		random_reference = str(uuid.uuid4())

		description = None
		if 'description' in request.form:
			description = request.form['description']

		# Add file to database
		db.session.add(MapFile(
			user_id=current_user.get_id(),
			description=description,
			file_name=new_name,
			file_location=random_name,
			file_uuid=random_reference
		))

		# Save file to server
		file_path = path.join(current_app.config['MAP_FILES_DEST'], random_name)
		file.save(file_path)

		current_app.mapfileprocessor.send([random_reference, file_path])

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
