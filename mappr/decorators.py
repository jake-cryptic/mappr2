from functools import wraps
from flask import request, abort


def internally_referred(f):
	@wraps(f)
	def decorated_function(*args, **kwargs):
		if request.referrer is None:
			return abort(400, description='Request invalid')

		if request.host not in request.referrer:
			return abort(400, description='Request source disallowed')

		return f(*args, **kwargs)

	return decorated_function
