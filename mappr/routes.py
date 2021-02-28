from flask import render_template, send_from_directory, Blueprint, redirect, url_for, flash
from flask_login import current_user, login_required

main_bp = Blueprint("main_bp", __name__)


@main_bp.route("/")
@login_required
def index():
	return redirect(url_for('map_bp.map'))


@main_bp.route("/contribute")
@login_required
def contribute():
	return render_template('help/contribute.html')


@main_bp.route("/privacy-policy")
def privacy():
	return render_template('help/privacy.html')


@main_bp.route("/terms-of-use")
def terms():
	return render_template('help/terms-of-use.html')
