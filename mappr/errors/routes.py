from flask import Blueprint, request, abort, jsonify, render_template
from flask_login import current_user, login_required
from ..functions import resp

error_bp = Blueprint('errors', __name__, template_folder="templates")


@error_bp.app_errorhandler(404)
def handle_404(err):
	if request.path.startswith('/api/'):
		return resp({}, error='Not Found')
	else:
		return render_template('errors/404.html'), 404


@error_bp.app_errorhandler(500)
def handle_500(err):
	return render_template('errors/500.html'), 500
