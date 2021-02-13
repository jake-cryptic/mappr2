from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_wtf import CSRFProtect

db = SQLAlchemy()
csrf = CSRFProtect()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__, template_folder="templates", instance_relative_config=False, static_folder="static")
    app.config.from_object('config.Config')

    db.init_app(app)
    login_manager.init_app(app)
    csrf.init_app(app)
    app.testing = True

    with app.app_context():
        from . import routes
        from .api import routes as api_routes
        from .auth import routes as auth_routes
        from .map import routes as map_routes
        from .statistics import routes as statistics_routes
        from .user import routes as user_routes

        app.register_blueprint(routes.main_bp)
        app.register_blueprint(api_routes.api_bp)
        app.register_blueprint(auth_routes.auth_bp)
        app.register_blueprint(map_routes.map_bp)
        app.register_blueprint(statistics_routes.statistics_bp)
        app.register_blueprint(user_routes.user_bp)

        db.create_all()

    return app


app = create_app()
