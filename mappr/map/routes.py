from os import path, makedirs
from flask import Blueprint, render_template, current_app
from flask_login import login_required

map_bp = Blueprint("map_bp", __name__, template_folder="templates")

# Create file upload directories if they don't exist
if not path.exists(current_app.config['MAP_FILES_DEST']):
	makedirs(current_app.config['MAP_FILES_DEST'])


@map_bp.route('/map', methods=['GET'])
@login_required
def mappr():
	return render_template('map/map.html')


@map_bp.route('/map2', methods=['GET'])
@login_required
def mappr2():
	return render_template('map/mappr.html')


@map_bp.route('/map/files', methods=['GET'])
@login_required
def files():
	return render_template('map/files.html')

