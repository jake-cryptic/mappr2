from os import path, makedirs
from flask import Blueprint, render_template, current_app
from flask_login import current_user, login_required
from ..models import db, User

map_bp = Blueprint("map_bp", __name__, template_folder="templates")

# Create file upload directories if they don't exist
if not path.exists(current_app.config['MAP_FILES_DEST']):
	makedirs(current_app.config['MAP_FILES_DEST'])


@map_bp.route('/map', methods=['GET', 'POST'])
@login_required
def mappr():
	return render_template('map/map.html')


@map_bp.route('/map/files', methods=['GET'])
@login_required
def map_files():
	return render_template('map/files.html')

