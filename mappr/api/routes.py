from flask import Blueprint, request, abort, session
from flask_login import current_user, login_required
from sqlalchemy import text
from .. import limiter
from ..decorators import internally_referred
from ..functions import resp
from ..models import db, Node, Sector, Bookmark, NodeLocation, User

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


@limiter.request_filter
def user_whitelist():
	if not current_user.is_authenticated:
		return False

	# Don't rate limit user accounts greater than type 2
	return current_user.account_type > 2


@api_bp.app_errorhandler(404)
@api_bp.app_errorhandler(405)
def _handle_api_error(ex):
	if request.path.startswith('/api/'):
		return resp({}, error='Unknown')
	else:
		return ex


@api_bp.route('/stats/networks', methods=['GET'])
@login_required
@internally_referred
def api_stats_networks():
	pass


@api_bp.route('/stats/users', methods=['GET'])
@login_required
@internally_referred
def api_stats_users():
	pass


@api_bp.route('/update-node', methods=['POST'])
@login_required
@limiter.limit('300/day;100/hour;5/minute', override_defaults=True)
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
@limiter.limit('300/day;100/hour;5/minute', override_defaults=True)
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
@internally_referred
@limiter.limit('100/day;50/hour;3/minute;1/second', override_defaults=True)
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
@limiter.limit('10000/day;1000/hour;100/minute;3/second', override_defaults=True)
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
	def run_query(query):
		return query.limit(1024).all()

	def filter_query(query):
		# Filter by samples
		if not show_low_accuracy:
			query = query.filter(
				Node.samples > 25
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

		return query

	def get_area_query(model):
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

		return node_query

	def get_node_location(node):
		locations = NodeLocation.query.filter(
			NodeLocation.mcc == node.mcc,
			NodeLocation.mnc == node.mnc,
			NodeLocation.node_id == node.node_id
		).all()

		# No location found
		if len(locations) == 0:
			return -1, node.lat, node.lng
		elif len(locations) == 1:
			location = locations[0]
			return location.user_id, location.lat, location.lng
		else:
			final_location = locations[0]

			for location_row in locations:
				if location_row.time_created > final_location.time_created:
					final_location = location_row

			return final_location.user_id, final_location.lat, final_location.lng

	def get_sectors_for_node(mcc, mnc, node_id):
		sectors_query = db.session.query(Sector).filter(
			Sector.mcc == mcc,
			Sector.mnc == mnc,
			Sector.node_id == node_id
		)

		if len(sectors_allowed) != 0:
			sectors_query = sectors_query.filter(
				Sector.sector_id.in_(sectors_allowed)
			)

		sectors_result = sectors_query.limit(256).all()

		sect_dict = {}
		for sector_row in sectors_result:
			sect_dict[sector_row.sector_id] = [
				float(sector_row.lat),
				float(sector_row.lng),
				sector_row.created,
				sector_row.updated,
				sector_row.pci
			]

		return sect_dict

	# Query all node IDs in an area
	base_results = run_query(filter_query(get_area_query(Node)))
	mappr_results = run_query(get_area_query(NodeLocation))
	results = base_results + mappr_results

	# Get list of unique node identifiers in map area
	nodes = set(results)

	# Lookup all information for nodes
	node_list = []
	for node in nodes:
		node_query = db.session.query(Node).filter(
			Node.mcc == node.mcc,
			Node.mnc == node.mnc,
			Node.node_id == node.node_id
		)

		results = filter_query(node_query).all()
		if len(results) == 0:
			continue

		row = results[0]

		# If user wants to see MLS locations, don't query NodeLocation model
		if show_mappr:
			is_located, lat, lng = get_node_location(row)
		else:
			is_located = -1
			lat = row.lat
			lng = row.lng

		# If user doesn't want to see MLS locations, then, dont...
		if not show_mls:
			if is_located == -1:
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

	# print('Query %s MLS, %s Mappr, %s total, %s filtered, %s final' % (len(mls_results), len(mappr_results), len(results), len(nodes), len(node_list)))

	return resp(node_list)


@api_bp.route('/get-mccs', methods=['GET'])
@login_required
def api_get_mnc_list():
	mnc_query = db.engine.execute(text('SELECT DISTINCT nodes.mcc, nodes.mnc FROM nodes'))
	mnc_list = [[row[0], row[1]] for row in mnc_query]
	return resp(mnc_list)


@api_bp.route('/get-sectors', methods=['GET'])
@login_required
@internally_referred
def api_get_sector_list():
	mcc = request.args.get('mcc')

	if not mcc:
		resp({}, error='Cannot process this request')

	sector_query = db.engine.execute(
		text('SELECT DISTINCT(sector_id), mnc FROM sectors WHERE mnc in (SELECT DISTINCT(mnc) as mnc FROM sectors) AND mcc=:mcc ORDER BY mnc, sector_id').params(mcc = mcc)
	)

	results = {}
	for row in sector_query:
		if row[1] not in results:
			results[row[1]] = []
		results[row[1]].append(row[0])

	return resp(results)


@api_bp.route('/users/get', methods=['POST'])
@login_required
@internally_referred
def api_get_user_names():
	all_users = db.session.query(User).all()

	user_list = {}
	for user in all_users:
		user_list[user.id] = user.name

	return resp(user_list)


@api_bp.route('/bookmark/create', methods=['POST'])
@login_required
@internally_referred
@limiter.limit('100/day;50/hour;5/minute;1/second', override_defaults=True)
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
@internally_referred
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
@internally_referred
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
