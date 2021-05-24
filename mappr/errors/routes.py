from flask import Blueprint, request, render_template
from ..functions import resp

error_bp = Blueprint('error_bp', __name__, template_folder="templates")


@error_bp.route('/unsupported', methods=['GET'])
def handle_unsupported():
	return render_template('errors/unsupported.html')


@error_bp.app_errorhandler(400)
def handle_400(err):
	if request.path.startswith('/api/'):
		return resp({}, error=str(err))
	else:
		return render_template('errors/400.html', description=str(err.description)), 400


@error_bp.app_errorhandler(403)
def handle_403(err):
	if request.path.startswith('/api/'):
		return resp({}, error='Forbidden')
	else:
		return render_template('errors/403.html', description=str(err.description)), 403


@error_bp.app_errorhandler(404)
def handle_404(err):
	if request.path.startswith('/api/'):
		return resp({}, error='Not Found')
	else:
		return render_template('errors/404.html'), 404


@error_bp.app_errorhandler(405)
def handle_405(err):
	if request.path.startswith('/api/'):
		return resp({}, error='Method not allowed')
	else:
		return render_template('errors/405.html'), 4005


@error_bp.errorhandler(413)
def handle_413(err):
	return "File is too large", 413


@error_bp.app_errorhandler(429)
def handle_429(err):
	if request.path.startswith('/api/'):
		return resp({}, error=str(err))
	else:
		return render_template('errors/429.html', description=str(err)), 429


@error_bp.app_errorhandler(500)
def handle_500(err):
	return render_template('errors/500.html'), 500


@error_bp.app_errorhandler(503)
@error_bp.route('/unavailable', methods=['GET'])
def handle_503(err=None):
	return render_template('errors/503.html'), 503
