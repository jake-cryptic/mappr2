from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import current_user, login_required
from ..models import db, Node, Sector
from .. import login_manager

statistics_bp = Blueprint("statistics_bp", __name__, template_folder="templates")


@statistics_bp.route('/statistics', methods=['GET'])
@login_required
def statistics():
	return render_template('statistics/statistics.html')
