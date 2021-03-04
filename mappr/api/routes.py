from flask import Blueprint, request, abort, session
from flask_login import current_user, login_required
from sqlalchemy import text
from ..decorators import internally_referred
from ..functions import resp
from ..models import db, Node, Sector, Bookmark, NodeLocation

api_bp = Blueprint("api_bp", __name__, template_folder="templates", url_prefix='/api')

required_arguments = {
	'map': ['time', 'rat', 'mcc', 'mnc', 'ne_lat', 'ne_lng', 'sw_lat', 'sw_lng', 'show_mls', 'show_mappr'],
	'history': ['mcc', 'mnc', 'node_id']
}


def check_request_args(user_args, args):
	for argument in args:
		if argument not in user_args:
			print(argument)
			return False

	return True


@api_bp.app_errorhandler(404)
@api_bp.app_errorhandler(405)
def _handle_api_error(ex):
	if request.path.startswith('/api/'):
		return resp({}, error='Unknown')
	else:
		return ex


@api_bp.route('/stats/networks', methods=['GET'])
@login_required
def api_stats_networks():
	pass


@api_bp.route('/stats/users', methods=['GET'])
@login_required
def api_stats_users():
	pass


@api_bp.route('/update-node', methods=['POST'])
@login_required
def api_update_node():
	user_id = current_user.id
	rat = request.form.get('rat')
	mcc = request.form.get('mcc')
	mnc = request.form.get('mnc')
	node_id = request.form.get('node_id')

	lat = float(request.form.get('lat'))
	lng = float(request.form.get('lng'))

	new_location = NodeLocation(user_id=user_id, mcc=mcc, mnc=mnc, node_id=node_id, lat=lat, lng=lng)
	db.session.add(new_location)
	db.session.commit()

	return resp({
		'node_id': node_id,
		'lat': lat,
		'lng': lng
	})


@api_bp.route('/lookup-history', methods=['GET'])
@login_required
def api_node_history():
	if not check_request_args(request.args, required_arguments['history']):
		return abort(400)

	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')
	node_id = request.args.get('node_id')

	history_query = NodeLocation.query.filter_by(
		mcc=mcc,
		mnc=mnc,
		node_id=node_id
	).all()

	history_list = [{
		'mcc': row.mcc,
		'mnc': row.mnc,
		'node_id': row.node_id,
		'user_id': row.user_id,
		'time': row.time_created,
		'lat': float(row.lat),
		'lng': float(row.lng),
	} for row in history_query]

	return resp(history_list)


@api_bp.route('/lookup-node', methods=['GET'])
@login_required
def api_lookup_node():
	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')
	node_id = request.args.get('node_id')

	if not node_id:
		return resp(error='No node_id specified')

	if not mnc:
		node_query = Node.query.filter_by(
			mcc=mcc,
			node_id=node_id
		).all()
	else:
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
@internally_referred
def api_get_map_area():
	if not check_request_args(request.args, required_arguments['map']):
		return abort(400)

	rat = request.args.get('rat')
	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')

	ne_lat = float(request.args.get('ne_lat'))
	ne_lng = float(request.args.get('ne_lng'))
	sw_lat = float(request.args.get('sw_lat'))
	sw_lng = float(request.args.get('sw_lng'))

	# Time filters
	date_filter = request.args.get('date[filter]') or 'created'
	lower_date = int(request.args.get('date[lower]') or 0)
	upper_date = int(request.args.get('date[upper]') or 0)

	# Node ID filters
	enb_lower = request.args.get('enb_range[lower]')
	enb_upper = request.args.get('enb_range[upper]')
	enb_singular = request.args.get('enb')

	# Sector filters
	sectors_allowed = request.args.getlist('sectors[]')
	pci = request.args.get('pci')

	def convert_bool(bv):
		if bv is None:
			return False
		if bv == 'false':
			return False
		return True

	# Pin type filters
	show_mls = convert_bool(request.args.get('show_mls'))
	show_mappr = convert_bool(request.args.get('show_mappr'))
	show_low_accuracy = convert_bool(request.args.get('show_low_accuracy'))

	# Define functions for use
	def filter_query(query):
		# Filter by samples
		if not show_low_accuracy:
			query = query.filter(
				Node.samples > 50
			)

		# Filter by date
		if date_filter == 'created':
			query = query.filter(
				Node.created >= lower_date,
				Node.created <= upper_date
			)
		elif date_filter == 'updated':
			query = query.filter(
				Node.updated >= lower_date,
				Node.updated <= upper_date
			)

		# Filter by node ID range
		if enb_lower is not None and enb_upper is not None:
			query = query.filter(
				Node.node_id >= int(enb_lower),
				Node.node_id <= int(enb_upper)
			)

		# Filter by a single node ID
		if enb_singular is not None:
			query = query.filter(
				Node.node_id == enb_singular
			)

		return query.all()

	def get_nodes_for_area(model):
		node_query = db.session.query(model).filter(
			model.mcc == mcc,
			model.lat >= sw_lat,
			model.lng >= sw_lng,
			model.lat <= ne_lat,
			model.lng <= ne_lng
		)

		# Filter MNC
		if mnc != "0":
			node_query = node_query.filter(
				model.mnc == mnc
			)

		return node_query.all()

	def get_node_location(node):
		locations = NodeLocation.query.filter(
			NodeLocation.mcc == node.mcc,
			NodeLocation.mnc == node.mnc,
			NodeLocation.node_id == node.node_id
		).all()

		# No location found
		if len(locations) == 0:
			return 0, node.lat, node.lng
		elif len(locations) == 1:
			location = locations[0]
			return location.user_id, location.lat, location.lng
		else:
			final_location = locations[0]

			for row in locations:
				if row.time_created > final_location.time_created:
					final_location = row

			return final_location.user_id, final_location.lat, final_location.lng

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

	# Query all node IDs in an area
	mls_results = get_nodes_for_area(Node)
	mappr_results = get_nodes_for_area(NodeLocation)
	results = mls_results + mappr_results

	# Get list of unique node identifiers in map area
	nodes = []
	for row in results:
		iden = str(row.mcc) + '-' + str(row.mnc) + '-' + str(row.node_id)
		if iden not in nodes:
			nodes.append(iden)

	# Lookup all information for nodes
	node_list = []
	for iden in nodes:
		idenspl = iden.split('-')
		node_query = db.session.query(Node).filter(
			Node.mcc == idenspl[0],
			Node.mnc == idenspl[1],
			Node.node_id == idenspl[2]
		)

		results = filter_query(node_query)
		if len(results) == 0:
			continue

		row = results[0]

		# If user wants to see MLS locations, don't query NodeLocation model
		if show_mappr:
			is_located, lat, lng = get_node_location(row)
		else:
			is_located = 0
			lat = row.lat
			lng = row.lng

		# If user doesn't want to see MLS locations, then, dont...
		if not show_mls:
			if is_located == 0:
				continue

		node_list.append({
			'mcc': row.mcc,
			'mnc': row.mnc,
			'node_id': row.node_id,
			'lat': float(lat),
			'lng': float(lng),
			'user_id': is_located,
			'created': row.created,
			'updated': row.updated,
			'samples': row.samples,
			'sectors': get_sectors_for_node(row.mcc, row.mnc, row.node_id)
		})

	return resp(node_list)


@api_bp.route('/get-mccs', methods=['GET'])
@login_required
def api_get_mnc_list():
	mnc_query = db.engine.execute(text('SELECT DISTINCT nodes.mcc, nodes.mnc FROM nodes'))
	mnc_list = [[row[0], row[1]] for row in mnc_query]
	return resp(mnc_list)


@api_bp.route('/get-sectors', methods=['GET'])
@login_required
def api_get_sector_list():
	mcc = request.args.get('mcc')

	if not mcc:
		resp({}, error='Cannot process this request')

	sector_query = db.engine.execute(text(
		'SELECT DISTINCT(sector_id), mnc FROM sectors WHERE mnc in (SELECT DISTINCT(mnc) as mnc FROM sectors) ORDER BY mnc, sector_id'))

	results = {}
	for row in sector_query:
		if row[1] not in results:
			results[row[1]] = []
		results[row[1]].append(row[0])

	return resp(results)


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
