from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_user, current_user, logout_user, login_required
from is_safe_url import is_safe_url
from ..forms import LoginUserForm, CreateUserForm
from ..models import db, User
from .. import login_manager

auth_bp = Blueprint("auth_bp", __name__, template_folder="templates")

login_manager.login_view = "auth_bp.auth"


@auth_bp.route('/auth', methods=['GET', 'POST'])
def auth():
	login_form = LoginUserForm()
	create_form = CreateUserForm()

	if current_user.is_authenticated:
		flash('You are already logged in!', 'warning')
		return redirect(url_for('user_bp.account'))

	if login_form.validate_on_submit():
		user = User.query.filter_by(email=login_form.login_email.data).first()

		if user is None:
			flash(u'Could not log you in, please try again.', 'danger')
		elif not user.verify_password(login_form.login_password.data):
			flash(u'Could not log you in please try again.', 'danger')
		else:
			login_user(user)

			next = request.args.get('next')
			if not is_safe_url(next, {'localhost'}, require_https=False):
				return abort(400)

			return redirect(next or url_for('main_bp.index'))

		return render_template('auth/auth.html', title='Login Required', login_user=login_form, create_user=create_form)

	if create_form.validate_on_submit():
		user = User.query.filter_by(email=create_form.create_email.data).first()

		if user is None:
			new_user = User(
				name=create_form.create_name.data,
				email=create_form.create_email.data,
				password=create_form.create_password.data,
				active=0,
				account_type=1
			)

			db.session.add(new_user)
			db.session.flush()
			db.session.commit()

			flash(u'Account has been created. You can now login.', 'success')
		else:
			flash(u'Email address cannot be used', 'warning')

		return redirect(url_for('auth_bp.auth'))

	return render_template('auth/auth.html', title='Login Required', login_user=login_form, create_user=create_form)


@auth_bp.route("/logout")
@login_required
def logout():
	"""User log-out logic."""
	logout_user()
	return redirect(url_for("main_bp.index"))


@login_manager.user_loader
def load_user(user_id):
	"""Check if user is logged-in on every page load."""
	if user_id is not None:
		return User.query.get(user_id)

	return None
