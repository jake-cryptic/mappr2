from os import path, makedirs
from flask import Blueprint, request, render_template, current_app
from flask_login import current_user, login_required
from werkzeug.utils import secure_filename
from ..functions import resp
from ..models import db, User
from .. import limiter

gallery_bp = Blueprint("gallery_bp", __name__, template_folder="templates", url_prefix='/collections')

# Create file upload directories if they don't exist
if not path.exists(current_app.config['GALLERY_FILES_DEST']):
	makedirs(current_app.config['GALLERY_FILES_DEST'])


@gallery_bp.route('/', methods=['GET'])
@login_required
def home():
	return render_template('gallery/home.html')


@gallery_bp.route('/add', methods=['GET'])
@login_required
def add():
	return render_template('gallery/upload.html')


@gallery_bp.route('/upload', methods=['POST'])
@limiter.limit('20/hour;6/minute;2/second')
@login_required
def upload():
	print(request.files)

	def allowed_file(filename):
		return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['GALLERY_UPLOAD_EXTENSIONS']

	if len(request.files) == 0:
		return resp({}, error='Cannot process this request')

	saved_files = []

	for file_index in request.files:
		file = request.files[file_index]
		if file and allowed_file(file.filename):
			new_filename = secure_filename(file.filename)
			file.save(path.join(current_app.config['UPLOAD_PATH'], new_filename))

			saved_files.append({
				'original': file.filename,
				'new': new_filename
			})

	if len(saved_files) == 0:
		return resp({}, error='No files saved')

	return resp({
		'files': saved_files
	})
