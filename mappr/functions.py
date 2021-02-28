from flask import jsonify


def resp(data=None, **kwargs):
	err = False
	msg = ''
	if 'error' in kwargs:
		err = True
		msg = kwargs['error']

	return jsonify({
		'license': 'This API data is private and only available for use with permission',
		'error': err,
		'message': msg,
		'response': data
	})
