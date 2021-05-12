from os import path, makedirs
from flask import Blueprint, render_template, current_app
from flask_login import current_user, login_required
from ..models import db, User
from .. import login_manager

map_bp = Blueprint("map_bp", __name__, template_folder="templates")


@map_bp.route('/map', methods=['GET', 'POST'])
@login_required
def mappr():
	return render_template('map/map.html')
