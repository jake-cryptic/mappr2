from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import current_user, login_required, fresh_login_required
from ..models import db, Node, Sector
from .. import login_manager

statistics_bp = Blueprint("statistics_bp", __name__, template_folder="templates", url_prefix='/statistics')


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
