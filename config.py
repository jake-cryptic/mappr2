from os import environ
from os.path import join, dirname
from dotenv import load_dotenv
from datetime import timedelta


dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


class Config:

	TESTING = environ.get('TESTING')
	DEBUG = environ.get('FLASK_DEBUG')
	SECRET_KEY = environ.get('SECRET_KEY')

	# https://flask.palletsprojects.com/en/master/config/#SESSION_COOKIE_SECURE
	SESSION_COOKIE_NAME = environ.get('SESSION_COOKIE_NAME')
	SESSION_COOKIE_SECURE = environ.get('SESSION_COOKIE_SECURE')
	SESSION_COOKIE_HTTPONLY = environ.get('SESSION_COOKIE_HTTPONLY')

	REMEMBER_COOKIE_DURATION = timedelta(seconds=int(environ.get('REMEMBER_COOKIE_DURATION')))

	GALLERY_MAX_CONTENT_LENGTH = 1024 * 1024 * 12
	GALLERY_UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
	GALLERY_FILES_DEST = join('uploads', 'images')

	MAP_MAX_CONTENT_LENGTH = 1024 * 1024 * 5
	MAP_UPLOAD_EXTENSIONS = ['csv']
	MAP_FILES_DEST = join('uploads', 'maps')

	SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
	SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
	SQLALCHEMY_POOL_RECYCLE = 90

	MONGO_URI = environ.get('MONGO_URI')
