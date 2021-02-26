from os import environ
from os.path import join, dirname
from dotenv import load_dotenv


dotenv_path = join(dirname(__file__), '.env')
load_dotenv(dotenv_path)


class Config:

	TESTING = environ.get('TESTING')
	DEBUG = environ.get('FLASK_DEBUG')
	SECRET_KEY = environ.get('SECRET_KEY')

	# 5MB
	MAX_CONTENT_LENGTH = 1024 * 1024 * 5
	UPLOAD_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp']
	UPLOAD_PATH = 'image_uploads'

	SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
	SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
	SQLALCHEMY_POOL_RECYCLE = 90
