from os import environ
from dotenv import load_dotenv

load_dotenv()


class Config:

	TESTING = environ.get('TESTING')
	DEBUG = environ.get('FLASK_DEBUG')
	SECRET_KEY = environ.get('SECRET_KEY')

	SQLALCHEMY_DATABASE_URI = environ.get('SQLALCHEMY_DATABASE_URI')
	SQLALCHEMY_TRACK_MODIFICATIONS = environ.get('SQLALCHEMY_TRACK_MODIFICATIONS')
	SQLALCHEMY_POOL_RECYCLE = 90
