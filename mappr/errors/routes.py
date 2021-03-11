from flask import Blueprint, request, render_template
from ..functions import resp

error_bp = Blueprint('errors', __name__, template_folder="templates")


@error_bp.app_errorhandler(400)
def handle_400(err):
	if request.path.startswith('/api/'):
		return resp({}, error=str(err))
	else:
		return render_template('errors/400.html', description=str(err.description)), 400


@error_bp.app_errorhandler(404)
def handle_404(err):
	if request.path.startswith('/api/'):
		return resp({}, error='Not Found')
	else:
		return render_template('errors/404.html'), 404


@error_bp.app_errorhandler(500)
def handle_500(err):
	return render_template('errors/500.html'), 500
