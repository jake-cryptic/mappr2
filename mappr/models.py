from datetime import datetime
from mappr import db
from sqlalchemy import Integer, SmallInteger, Sequence, Index, UniqueConstraint
from sqlalchemy.types import DECIMAL
from sqlalchemy_utils import UUIDType
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import UserMixin
import uuid


class User(UserMixin, db.Model):
	__tablename__ = 'users'

	id = db.Column(db.Integer, primary_key=True)
	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

	# Information to be provided by user
	name = db.Column(db.String(50), nullable=False)
	password_hash = db.Column(db.String(128))
	password = db.Column(db.String(60), nullable=False)
	email = db.Column(db.String(256), unique=True, nullable=False)
	active = db.Column(db.SmallInteger, nullable=False, default=0)
	account_type = db.Column(db.SmallInteger, nullable=False, default=0)

	bookmarks = db.relationship("Bookmark", back_populates='user')
	locations = db.relationship("NodeLocation", back_populates='user')
	gallery_file = db.relationship("GalleryFile", back_populates='user')
	map_files = db.relationship("MapFile", back_populates='user')

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
	pci = db.Column(SmallInteger, default=-1, nullable=False)

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
		UniqueConstraint('mcc', 'mnc', 'node_id', 'sector_id', name='unique_sector')
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


class NodeLocation(db.Model):
	__tablename__ = 'node_locations'

	id = db.Column(Integer, Sequence('node_loc_id_seq'), primary_key=True)
	user_id = db.Column(Integer, db.ForeignKey('users.id'))
	user = db.relationship('User', back_populates='locations')

	mcc = db.Column(SmallInteger, nullable=False)
	mnc = db.Column(SmallInteger, nullable=False)

	node_id = db.Column(Integer, nullable=False)

	lat = db.Column(DECIMAL(8, 6), nullable=False)
	lng = db.Column(DECIMAL(9, 6), nullable=False)

	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

	def __repr__(self):
		return "<NodeLocation(id='%s', node_id='%s', lat='%s', lng='%s')>" % (self.id, self.node_id, self.lat, self.lng)


class CellIdBlockList(db.Model):
	__tablename__ = 'blocked_cells'

	id = db.Column(Integer, Sequence('cell_blocked_id_seq'), primary_key=True)
	user_id = db.Column(Integer, db.ForeignKey('users.id'))

	mcc = db.Column(SmallInteger, nullable=False)
	mnc = db.Column(SmallInteger, nullable=False)
	cell_id = db.Column(Integer, nullable=False)

	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

	def __repr__(self):
		return "<BlockedCellId(id='%s', user_id='%s', cell_id='%s')>" % (self.id, self.user_id, self.cell_id)


class Bookmark(db.Model):
	__tablename__ = 'bookmarks'

	id = db.Column(Integer, Sequence('bookmark_id_seq'), primary_key=True)
	user_id = db.Column(Integer, db.ForeignKey('users.id'))
	user = db.relationship('User', back_populates='bookmarks')

	mcc = db.Column(SmallInteger, nullable=False)
	mnc = db.Column(SmallInteger, nullable=False)

	lat = db.Column(DECIMAL(8, 6), nullable=False)
	lng = db.Column(DECIMAL(9, 6), nullable=False)
	zoom = db.Column(SmallInteger, nullable=False)

	comment = db.Column(db.Text, nullable=True)

	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

	def __repr__(self):
		return "<Bookmark(id='%s', lat='%s', lng='%s')>" % (self.id, self.lat, self.lng)


class GalleryFile(db.Model):
	__tablename__ = 'gallery_files'

	id = db.Column(Integer, Sequence('galleryfile_id_seq'), primary_key=True)
	user_id = db.Column(Integer, db.ForeignKey('users.id'))
	user = db.relationship('User', back_populates='gallery_file')

	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	permission = db.Column(db.SmallInteger, nullable=False, default=0)
	processing = db.Column(db.SmallInteger, nullable=False, default=1)		# Indicates if the file is being processed

	alt_text = db.Column(db.Text, nullable=False, default='Image has no alt-text')
	description = db.Column(db.Text, nullable=True)

	file_name = db.Column(db.Text, nullable=False) 							# Original filename
	file_type = db.Column(db.Text, nullable=False)							# File type (png, jpg etc)
	file_location = db.Column(UUIDType, nullable=False)						# New filename
	file_uuid = db.Column(UUIDType, nullable=False)							# Reference to access file


class MapFile(db.Model):
	__tablename__ = 'map_files'

	id = db.Column(Integer, Sequence('mapfile_id_seq'), primary_key=True)
	user_id = db.Column(Integer, db.ForeignKey('users.id'))
	user = db.relationship('User', back_populates='map_files')

	time_created = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
	permission = db.Column(db.SmallInteger, nullable=False, default=1)
	processing = db.Column(db.SmallInteger, nullable=False, default=1)		# Indicates if the file is being processed

	description = db.Column(db.Text, nullable=True)

	file_name = db.Column(db.Text, nullable=False)
	file_location = db.Column(UUIDType, nullable=False)
	file_uuid = db.Column(UUIDType, nullable=False)
