from functools import wraps
from flask import request, abort, redirect, url_for


def internally_referred(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if request.referrer is None:
			return abort(400, description='Request invalid')

		if request.host not in request.referrer:
			return abort(400, description='Request source disallowed')

		return f(*args, **kwargs)

	return decorated_function


def force_modern_browser(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		isAllowed = True
		b = request.user_agent.browser
		v = request.user_agent.version and int(request.user_agent.version.split('.')[0])

		if b == 'msie': isAllowed = False
		if b == 'firefox' and v < 50: isAllowed = False
		if b == 'chrome' and v < 50: isAllowed = False

		if not isAllowed:
			return redirect(url_for('error_bp.handle_unsupported'))

		return f(*args, **kwargs)

	return decorated_function
