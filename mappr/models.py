from datetime import datetime
from mappr import db, login_manager
from sqlalchemy import Integer, SmallInteger, Sequence, Index, UniqueConstraint, ForeignKeyConstraint
from sqlalchemy.types import DECIMAL
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


class Sector(db.Model):
	__tablename__ = 'sectors'

	id = db.Column(Integer, Sequence('sector_id_seq'), primary_key=True)

	mcc = db.Column(SmallInteger, nullable=False)
	mnc = db.Column(SmallInteger, nullable=False)

	node_id = db.Column(Integer, nullable=False)
	sector_id = db.Column(SmallInteger, nullable=False)
	pci = db.Column(SmallInteger, nullable=False)

	lat = db.Column(DECIMAL(8, 6))
	lng = db.Column(DECIMAL(9, 6))
	range = db.Column(Integer)

	samples = db.Column(Integer)
	created = db.Column(Integer)
	updated = db.Column(Integer)

	def __repr__(self):
		return "<Sector(id='%s', enb='%s', sector='%s')>" % (self.id, self.node_id, self.sector_id)

	__table_args__ = (
		Index('sectors_index', 'mcc', 'mnc', 'node_id', 'sector_id'),
		UniqueConstraint('mcc', 'mnc', 'node_id', 'sector_id', name='unique_sector'),
    	ForeignKeyConstraint(['mcc', 'mnc', 'node_id',], ['nodes.mcc', 'nodes.mnc', 'nodes.node_id'])
	)


class Node(db.Model):
	__tablename__ = 'nodes'

	id = db.Column(Integer, Sequence('node_id_seq'), primary_key=True)

	mcc = db.Column(SmallInteger, nullable=False)
	mnc = db.Column(SmallInteger, nullable=False)

	node_id = db.Column(Integer, nullable=False)

	lat = db.Column(DECIMAL(8, 6), nullable=False)
	lng = db.Column(DECIMAL(9, 6), nullable=False)

	mean_lat = db.Column(DECIMAL(8, 6))
	mean_lng = db.Column(DECIMAL(9, 6))

	samples = db.Column(Integer)
	created = db.Column(Integer)
	updated = db.Column(Integer)

	def __repr__(self):
		return "<Node(id='%s', enb='%s')>" % (self.id, self.node_id)

	__table_args__ = (
		Index('nodes_index', 'mcc', 'mnc', 'node_id'),
		UniqueConstraint('mcc', 'mnc', 'node_id', name='unique_node')
	)
