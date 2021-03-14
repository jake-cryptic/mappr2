from flask import url_for, request, redirect, flash
from flask_admin.contrib.sqla import ModelView
from flask_login import current_user
from mappr import admin, db
from mappr.models import User, NodeLocation, Bookmark, Node, Sector, CellIdBlockList, MapFile


class AdminView(ModelView):
	column_exclude_list = ['password_hash', ]

	def is_accessible(self):
		if current_user.is_authenticated:
			if current_user.get_id():
				user = User.query.get(current_user.get_id())
				if user.account_type > 4 or current_user.id == 1:
					return True

		return False

	def inaccessible_callback(self, name, **kwargs):
		flash("You are not logged in as an administrator")
		return redirect(url_for('login', next=request.url))


admin.add_view(AdminView(User, db.session))
admin.add_view(AdminView(NodeLocation, db.session))
admin.add_view(AdminView(CellIdBlockList, db.session))
admin.add_view(AdminView(Bookmark, db.session))
admin.add_view(AdminView(MapFile, db.session, category='Files'))
admin.add_view(AdminView(Node, db.session, category='Base Data'))
admin.add_view(AdminView(Sector, db.session, category='Base Data'))
