from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import current_user, login_required, confirm_login, login_fresh, fresh_login_required
from ..models import db, User
from ..forms import UpdateEmailForm, UpdatePasswordForm, DeleteAccountForm, DownloadDataForm

user_bp = Blueprint("user_bp", __name__, template_folder="templates", url_prefix='/user')


@user_bp.route('/account', methods=['GET', 'POST'])
@login_required
def account():
	update_email = UpdateEmailForm(prefix="emc")

	update_user = User.query.filter_by(id=current_user.id).first()

	if request.method == 'POST':
		if update_email.validate_on_submit():
			entered_email = update_email.email.data
			entered_pass = update_email.password.data

			# Check password is correct
			if not current_user.verify_password(entered_pass):
				flash("Account password was incorrect.", 'danger')
				return redirect(url_for('user_bp.account'))

			# If user has re-entered password we can mark their session as fresh
			confirm_login()

			# Check if email already in use
			results = User.query.filter_by(email=entered_email).all()
			if len(results) > 0:
				flash("This email is already in use", 'warning')
				return redirect(url_for('user_bp.account'))

			update_user.email = entered_email
			db.session.commit()

			flash("Email was updated!", 'success')

		return redirect(url_for('user_bp.account'))

	return render_template('user/account.html', email_form=update_email, user_details=update_user, login_stale=not login_fresh())


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
				# If user has re-entered password we can mark their session as fresh
				confirm_login()

				# Update user password
				update_user.password = entered_newpass
				db.session.commit()

				flash("Password was updated!", 'success')

	return render_template('user/password.html', password_form=update_password)


@user_bp.route('/download', methods=['GET', 'POST'])
@login_required
def download():
	download_account = DownloadDataForm(prefix="dl")

	if request.method == "POST" and download_account.validate_on_submit():
		entered_pass = download_account.password.data

		# Check password is correct
		if not current_user.verify_password(entered_pass):
			flash("Current password was incorrect.", 'danger')
			return redirect(url_for('user_bp.download'))
		else:
			# If user has re-entered password we can mark their session as fresh
			confirm_login()

	return render_template('user/download.html', download_form=download_account)


@user_bp.route('/delete', methods=['GET', 'POST'])
@login_required
def delete():
	delete_account = DeleteAccountForm(prefix="rm")

	if request.method == "POST" and delete_account.validate_on_submit():
		entered_pass = delete_account.password.data
		entered_consent = delete_account.confirm_delete.data

		# Check password is correct
		if not current_user.verify_password(entered_pass):
			flash("Account password was incorrect.", 'danger')
			return redirect(url_for('user_bp.delete'))

		if not entered_consent:
			flash("Please give consent for the account to be deleted", 'danger')
			return redirect(url_for('user_bp.delete'))

	return render_template('user/delete.html', delete_form=delete_account)
