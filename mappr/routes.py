from flask import render_template, send_from_directory, Blueprint, redirect, url_for, request
from . import static_folder
from flask_login import login_required

main_bp = Blueprint("main_bp", __name__)


@main_bp.route('/robots.txt')
@main_bp.route('/security.txt')
def static_from_root():
	return send_from_directory(static_folder, request.path[1:])


@main_bp.route('/favicon.ico')
def favicon():
	return send_from_directory(static_folder, 'img/bus_256.png')


@main_bp.route('/')
@login_required
def index():
	return redirect(url_for('map_bp.mappr'))


@main_bp.route('/account')
@login_required
def account_redir():
	return redirect(url_for('user_bp.account'))


@main_bp.route('/contribute')
@login_required
def contribute():
	return render_template('help/contribute.html')


@main_bp.route('/privacy-policy')
def privacy():
	return render_template('help/privacy.html')


@main_bp.route('/terms-of-use')
def terms():
	return render_template('help/terms-of-use.html')


@main_bp.route('/proto/<req>')
def proto(req):
	print(req)
