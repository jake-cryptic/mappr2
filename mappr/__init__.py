from flask import Flask, request
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_admin import Admin
from flask_wtf import CSRFProtect

# Initialise objects
db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()
admin = Admin(name='Mappr2', template_mode='bootstrap4')

# Define folders
static_folder = 'static'
template_folder = 'templates'


def create_app():
	app = Flask(__name__, template_folder=template_folder, instance_relative_config=False, static_folder=static_folder)
	app.config.from_object('config.Config')

	db.init_app(app)
	login_manager.init_app(app)
	admin.init_app(app)
	csrf.init_app(app)

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
	login_manager.refresh_view = "auth_bp.reauth"
	login_manager.needs_refresh_message = (
		u"To protect your account, please reauthenticate to access this page."
	)
	login_manager.needs_refresh_message_category = "warning"

	@app.after_request
	def apply_headers(response):
		response.headers["Server"] = "Mappr2"

		if not request.path.startswith('/static/') and not request.path.startswith('/api/'):
			# TODO: Change 'Feature-Policy' to 'Permissions-Policy' soon
			response.headers["Feature-Policy"] = "fullscreen 'self'; geolocation 'self'; microphone 'none'; camera 'none'"
			response.headers["Referrer-Policy"] = "same-origin"
			response.headers["Strict-Transport-Security"] = "max-age=5184000"
			response.headers["X-Frame-Options"] = "Deny"
			response.headers["X-XSS-Protection"] = "1; mode=block"
			response.headers["X-Content-Type-Options"] = "nosniff"

			csp_header_value = "script-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://unpkg.com; img-src 'self' data: https://cdnjs.cloudflare.com https://api.cellmapper.net https://www.three.co.uk/ https://mapserver.vodafone.co.uk https://68aa7b45-tiles.spatialbuzz.net https://coverage.ee.co.uk https://mt1.google.com https://tile.opentopomap.org https://*.tile.openstreetmap.org; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; connect-src 'self' https://nominatim.openstreetmap.org https://mappr.report-uri.com; media-src 'none'; object-src 'none'; child-src 'none'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content; manifest-src 'self'; report-uri https://mappr.report-uri.com/r/d/csp/reportOnly"

			# Production only headers
			if app.config['ENV'] == 'production':
				response.headers['Content-Security-Policy-Report-Only'] = csp_header_value
				response.headers['Expect-CT'] = 'report-uri="https://mappr.report-uri.com/r/d/ct/reportOnly", max-age=30'
				response.headers['Report-To'] = '{"group":"default","max_age":3600,"endpoints":[{"url":"https://mappr.report-uri.com/a/d/g"}],"include_subdomains":true}'
				response.headers['NEL'] = '{"report_to":"default","max_age":3600,"include_subdomains":true}'

			# Testing headers
			if app.config['ENV'] == 'development':
				response.headers['Content-Security-Policy'] = csp_header_value

		if app.config['ENV'] == 'production' and 'https' not in request.base_url:
			response.headers['Upgrade-Insecure-Requests'] = 1

		return response

	return app


app = create_app()
