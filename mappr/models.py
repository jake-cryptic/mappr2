from datetime import datetime
from mappr import db, login_manager
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin


class User(UserMixin, db.Model):
	__tablename__ = 'user_accounts'

	id = db.Column(db.Integer, primary_key=True)
	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

	# Information to be provided by user
	name = db.Column(db.String(50), nullable=False)
	password_hash = db.Column(db.String(128))
	password = db.Column(db.String(60), nullable=False)
	email = db.Column(db.String(256), unique=True, nullable=False)
	active = db.Column(db.Integer, nullable=False)
	account_type = db.Column(db.Integer, nullable=False)

	@property
	def password(self):
		raise AttributeError("You cannot read the password attribute")

	@password.setter
	def password(self, password):
		# Docs: https://werkzeug.palletsprojects.com/en/1.0.x/utils/
		self.password_hash = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

	def verify_password(self, password):
		return check_password_hash(self.password_hash, password)

	def __unicode__(self):
		return self.name
