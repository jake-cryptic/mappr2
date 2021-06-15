from flask import Blueprint, render_template, redirect, url_for, request, abort
from flask_login import current_user, login_required, fresh_login_required
from ..functions import resp
from ..models import db, Node, Sector
from .. import login_manager
from . import queries

statistics_bp = Blueprint("statistics_bp", __name__, template_folder="templates", url_prefix='/statistics')


@statistics_bp.route('/api/networks/available', methods=['GET'])
@login_required
def network_api_stats():
	return resp(queries)


@statistics_bp.route('/api/networks/query', methods=['GET'])
@login_required
def network_api_query():
	mcc = request.args.get('mcc')
	mnc = request.args.get('mnc')
	query = request.args.get('query')
	time_start = request.args.get('start')
	time_end = request.args.get('end')
	interval = request.args.get('interval')

	#if query
	return


@statistics_bp.route('/networks', methods=['GET'])
@login_required
@fresh_login_required
def network_stats():
	return render_template('statistics/networks.html')


@statistics_bp.route('/users', methods=['GET'])
@login_required
@fresh_login_required
def user_stats():

	return render_template('statistics/users.html')
