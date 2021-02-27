from flask import Blueprint, request, abort, jsonify
from flask_login import current_user, login_required


gallery_bp = Blueprint("gallery_bp", __name__, template_folder="templates", url_prefix='/photos')
