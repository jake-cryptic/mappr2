from flask import Blueprint, request, abort, jsonify
from flask_login import current_user, login_required
from sqlalchemy import text
from ..models import db, Node, Sector, Bookmark

api_bp = Blueprint("api_bp", __name__, template_folder="templates", url_prefix='/api')


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


@api_bp.errorhandler(404)
@api_bp.errorhandler(405)
def _handle_api_error(ex):
	if request.path.startswith('/api/'):
		return resp({}, error='Unknown')
	else:
		return ex


@api_bp.route('/update-node', methods=['POST'])
@login_required
def api_update_node():
	pass


@api_bp.route('/lookup-node', methods=['GET'])
@login_required
def api_lookup_node():
	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')
	node_id = request.args.get('node_id')

	if not node_id:
		return resp(error='No node_id specified')

	node_query = Node.query.filter_by(
		mcc=mcc,
		mnc=mnc,
		node_id=node_id
	).all()

	node_list = [{
		'mcc': row.mcc,
		'mnc': row.mnc,
		'node_id': row.node_id,
		'lat': float(row.lat),
		'lng': float(row.lng),
	} for row in node_query]

	return resp(node_list)


@api_bp.route('/map', methods=['GET'])
@login_required
def api_get_map_area():
	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')

	ne_lat = float(request.args.get('ne_lat'))
	ne_lng = float(request.args.get('ne_lng'))
	sw_lat = float(request.args.get('sw_lat'))
	sw_lng = float(request.args.get('sw_lng'))

	node_query = db.session.query(Node).filter(
		Node.mcc == mcc,
		Node.mnc == mnc,
		Node.lat >= sw_lat,
		Node.lng >= sw_lng,
		Node.lat <= ne_lat,
		Node.lng <= ne_lng
	).all()

	def get_sectors_for_node(mcc, mnc, node_id):
		sectors_query = db.session.query(Sector).filter(
			Sector.mcc == mcc,
			Sector.mnc == mnc,
			Sector.node_id == node_id
		).all()

		sect_dict = {}
		for row in sectors_query:
			sect_dict[row.sector_id] = [
				float(row.lat),
				float(row.lng),
				row.created,
				row.updated,
				row.pci
			]

		return sect_dict

	node_list = [{
		'mcc': row.mcc,
		'mnc': row.mnc,
		'node_id': row.node_id,
		'lat': float(row.lat),
		'lng': float(row.lng),
		'created': row.created,
		'updated': row.updated,
		'samples': row.samples,
		'sectors': get_sectors_for_node(row.mcc, row.mnc, row.node_id)
	} for row in node_query]

	return resp(node_list)


@api_bp.route('/get-mccs', methods=['GET'])
@login_required
def api_get_mnc_list():
	mnc_query = db.engine.execute(text('SELECT DISTINCT nodes.mcc, nodes.mnc FROM nodes'))
	mnc_list = [[row[0], row[1]] for row in mnc_query]
	return resp(mnc_list)


@api_bp.route('/bookmark/create', methods=['POST'])
@login_required
def api_bookmark_create():
	user_id = current_user.id

	mcc = request.form.get('mcc')
	mnc = request.form.get('mnc')

	lat = float(request.form.get('lat'))
	lng = float(request.form.get('lng'))
	zoom = int(request.form.get('zoom'))

	comment = request.form.get('comment')

	new_bookmark = Bookmark(user_id=user_id, mcc=mcc, mnc=mnc, lat=lat, lng=lng, zoom=zoom, comment=comment)
	db.session.add(new_bookmark)
	db.session.commit()

	return resp({})


@api_bp.route('/bookmark/delete', methods=['POST'])
@login_required
def api_bookmark_remove():
	user_id = current_user.id

	mcc = request.form.get('mcc')
	mnc = request.form.get('mnc')
	id = request.form.get('id')

	bookmark_item = Bookmark.query.filter(
		id == id,
		user_id == user_id,
		mcc == mcc,
		mnc == mnc
	).one()

	if not bookmark_item:
		return resp({}, error=True, msg='Bookmark not found')

	db.session.delete(bookmark_item)
	db.session.commit()

	return resp({})


@api_bp.route('/bookmark/get', methods=['GET', 'POST'])
@login_required
def api_bookmark_get():
	user_id = current_user.id

	bookmark_query = Bookmark.query.filter_by(
		user_id=user_id
	).all()

	bookmark_list = [{
		'mcc': row.mcc,
		'mnc': row.mnc,
		'lat': float(row.lat),
		'lng': float(row.lng),
		'zoom': int(row.zoom),
		'comment': row.comment,
		'created': row.time_created,
		'id': row.id
	} for row in bookmark_query]

	return resp(bookmark_list)
