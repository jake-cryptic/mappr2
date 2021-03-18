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
		'message': msg,
		'response': data
	})


def get_user_data(model, uid):
	data = db.session.query(model).filter(
		model.user_id == uid
	).limit(4096).all()

	if len(data) == 0:
		data = []

	csv_headers = model.__table__.columns.keys()
	return results_to_csv(data, csv_headers)


def results_to_csv(results, csv_headers):
	out_text = ','.join(csv_headers)

	for row in results:
		row_dict = dict(row.__dict__)
		row_dict.pop('_sa_instance_state', None)
		out_text += ','.join(map(lambda x: str(x), row_dict.values())) + '\n'

	return out_text
