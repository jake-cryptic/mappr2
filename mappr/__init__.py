from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_admin import Admin
from flask_wtf import CSRFProtect

db = SQLAlchemy()
# csrf = CSRFProtect()
login_manager = LoginManager()
admin = Admin(name='Mappr2', template_mode='bootstrap4')


def create_app():
	app = Flask(__name__, template_folder="templates", instance_relative_config=False, static_folder="static")
	app.config.from_object('config.Config')

	db.init_app(app)
	login_manager.init_app(app)
	admin.init_app(app)
	# csrf.init_app(app)

	with app.app_context():
		from . import routes, views
		from .api import routes as api_routes
		from .auth import routes as auth_routes
		from .errors import routes as error_routes
		from .gallery import routes as gallery_routes
		from .map import routes as map_routes
		from .statistics import routes as statistics_routes
		from .user import routes as user_routes

		app.register_blueprint(routes.main_bp)
		app.register_blueprint(api_routes.api_bp)
		app.register_blueprint(auth_routes.auth_bp)
		app.register_blueprint(error_routes.error_bp)
		app.register_blueprint(gallery_routes.gallery_bp)
		app.register_blueprint(map_routes.map_bp)
		app.register_blueprint(statistics_routes.statistics_bp)
		app.register_blueprint(user_routes.user_bp)

		db.create_all()

	login_manager.login_view = "auth_bp.auth"

	@app.after_request
	def apply_headers(response):
		if not request.path.startswith('/static/') and not request.path.startswith('/api/'):
			# TODO: Change 'Feature-Policy' to 'Permissions-Policy' soon
			response.headers["Feature-Policy"] = "fullscreen 'self'; geolocation 'self'; microphone 'none'; camera 'none'"
			response.headers["Referrer-Policy"] = "same-origin"
			response.headers["Strict-Transport-Security"] = "max-age=5184000"
			response.headers["X-Frame-Options"] = "Deny"
			response.headers["X-XSS-Protection"] = "1; mode=block"
			response.headers["X-Content-Type-Options"] = "nosniff"

		return response

	return app


app = create_app()
