import uuid
from flask import jsonify
from . import db


def resp(data=None, **kwargs):
	err = False
	msg = ''
	if 'error' in kwargs:
		err = True
		msg = kwargs['error']

	return jsonify({
		'license': 'This API data is private and only available for use with permission',
		'error': err,
		'version': 2,
		'message': msg,
		'response': data
	})


def is_valid_uuid(uuid_to_test, version=4):
	try:
		uuid_obj = uuid.UUID(uuid_to_test, version=version)
	except ValueError:
		return False
	return str(uuid_obj) == uuid_to_test


def get_user_data(model, uid):
	data = db.session.query(model).filter(
		model.user_id == uid
	).limit(4096).all()

	if len(data) == 0:
		data = []

	csv_headers = model.__table__.columns.keys()
	csv_headers.remove('id')
	csv_headers.remove('user_id')
	return results_to_csv(data, csv_headers)


def results_to_csv(results, csv_headers):
	out_text = ','.join(csv_headers) + '\n'

	for row in results:
		row_dict = dict(row.__dict__)
		row_dict.pop('_sa_instance_state', None)

		for header in csv_headers:
			val = str(row_dict[header] or 'null')
			out_text += '"%s",' % val
		out_text += '\n'

	return out_text
