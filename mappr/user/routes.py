from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import current_user, login_required
from ..models import db, User
from ..forms import UpdateEmailForm, UpdatePasswordForm, DeleteAccountForm, DownloadDataForm
from .. import login_manager

user_bp = Blueprint("user_bp", __name__, template_folder="templates", url_prefix='/user')


@user_bp.route('/account', methods=['GET', 'POST'])
@login_required
def account():
	update_email = UpdateEmailForm(prefix="emc")
	delete_account = DeleteAccountForm(prefix="rm")
	download_account = DownloadDataForm(prefix="dl")

	update_user = User.query.filter_by(id=current_user.id).first()

	if request.method == 'POST':
		if update_email.validate_on_submit():
			entered_email = update_email.email.data
			entered_pass = update_email.password.data

			# Check password is correct
			if not current_user.verify_password(entered_pass):
				flash("Account password was incorrect.", 'danger')
				return redirect(url_for('user_bp.account'))

			# Check if email already in use
			results = User.query.filter_by(email=entered_email).all()
			if len(results) > 0:
				flash("This email is already in use", 'warning')
				return redirect(url_for('user_bp.account'))

			update_user.email = entered_email
			db.session.commit()

			flash("Email was updated!", 'success')

		if delete_account.validate_on_submit():
			entered_pass = delete_account.password.data
			entered_consent = delete_account.confirm_delete.data

			# Check password is correct
			if not current_user.verify_password(entered_pass):
				flash("Account password was incorrect.", 'danger')
				return redirect(url_for('user_bp.account'))

			if not entered_consent:
				flash("Please give consent for the account to be deleted", 'danger')
				return redirect(url_for('user_bp.account'))

		return redirect(url_for('user_bp.account'))

	return render_template('user/account.html', email_form=update_email, delete_form=delete_account, download_form=download_account, user_details=update_user)


@user_bp.route('/password', methods=['GET', 'POST'])
@login_required
def password():
	update_password = UpdatePasswordForm(prefix="pwc")

	if request.method == "POST":
		update_user = User.query.filter_by(id=current_user.id).first()

		if update_password.validate_on_submit():
			entered_pass = update_password.old_password.data
			entered_newpass = update_password.new_password.data

			# Check password is correct
			if not current_user.verify_password(entered_pass):
				flash("Current password was incorrect.", 'danger')
			else:
				update_user.password = entered_newpass
				db.session.commit()
				flash("Password was updated!", 'success')

	return render_template('user/password.html', password_form=update_password)


@user_bp.route('/download', methods=['GET', 'POST'])
@login_required
def download():
	download_account = DownloadDataForm(prefix="rm")

	return render_template('user/download.html', download_form=download_account)


@user_bp.route('/delete', methods=['GET', 'POST'])
@login_required
def delete():
	delete_account = DeleteAccountForm(prefix="rm")

	return render_template('user/delete.html', delete_form=delete_account)
