from flask import Blueprint, render_template, redirect, url_for, flash, request, abort, jsonify
from flask_login import current_user, login_required
from sqlalchemy import text
from ..models import db, User, Node, Sector

api_bp = Blueprint("api_bp", __name__, template_folder="templates", url_prefix='/api')


def resp(data, **kwargs):
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


@api_bp.route('/lookup-node/<int:mcc>/<int:mnc>/<int:node_id>', methods=['GET'])
@login_required
def api_lookup_node(mcc, mnc, node_id):
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


@api_bp.route('/map/<int:mcc>/<int:mnc>/<float:ne_lat>/<float:ne_lng>/<float:sw_lat>/<float:sw_lng>', methods=['GET'])
@login_required
def api_get_map_area(mcc, mnc, ne_lat, ne_lng, sw_lat, sw_lng):
	node_query = Node.query.filter_by(
		mcc=mcc,
		mnc=mnc
	).all()

	node_list = [{
		'node_id': row.node_id,
		'lat': float(row.lat),
		'lng': float(row.lng),
	} for row in node_query]

	return resp(node_list)


@api_bp.route('/get-mccs', methods=['GET'])
@login_required
def api_get_mnc_list():
	mnc_query = db.engine.execute(text('SELECT DISTINCT nodes.mcc, nodes.mnc FROM nodes'))
	mnc_list = [[row[0], row[1]] for row in mnc_query]
	return resp(mnc_list)
