from flask import Blueprint, request, abort, jsonify, render_template
from flask_login import current_user, login_required


gallery_bp = Blueprint("gallery_bp", __name__, template_folder="templates", url_prefix='/collections')

