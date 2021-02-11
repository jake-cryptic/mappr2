from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_user, current_user, logout_user, login_required
from ..models import db, User
from .. import login_manager

api_bp = Blueprint("api_bp", __name__, template_folder="templates")


@api_bp.errorhandler(404)
@api_bp.errorhandler(405)
def _handle_api_error(ex):
    if request.path.startswith('/api/'):
        return '{}'
    else:
        return ex
