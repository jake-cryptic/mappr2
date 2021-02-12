from flask import render_template, send_from_directory, Blueprint, redirect, url_for, flash
from flask_login import current_user, login_required

main_bp = Blueprint("main_bp", __name__)


# TODO: Make 404 pages work
@main_bp.errorhandler(404)
def page_not_found(e):
	return render_template('templates/errors/404.html')


@main_bp.route("/")
@login_required
def index():
	"""Landing page."""
	return redirect(url_for('map_bp.map'))
