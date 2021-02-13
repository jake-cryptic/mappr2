from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import current_user, login_required
from sqlalchemy import text, and_
from ..models import db, User, Node, Sector

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

	node_list = [{
		'mcc': row.mcc,
		'mnc': row.mnc,
		'node_id': row.node_id,
		'lat': float(row.lat),
		'lng': float(row.lng),
		'sectors': []
	} for row in node_query]

	return resp(node_list)


@api_bp.route('/get-mccs', methods=['GET'])
@login_required
def api_get_mnc_list():
	mnc_query = db.engine.execute(text('SELECT DISTINCT nodes.mcc, nodes.mnc FROM nodes'))
	mnc_list = [[row[0], row[1]] for row in mnc_query]
	return resp(mnc_list)
