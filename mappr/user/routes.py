from flask import Blueprint, render_template, redirect, url_for, flash, request, abort
from flask_login import login_user, current_user, logout_user, login_required
from ..models import db, User
from ..forms import UpdateEmailForm, UpdatePasswordForm, DeleteAccountForm, DownloadDataForm
from .. import login_manager

user_bp = Blueprint("user_bp", __name__, template_folder="templates")


@user_bp.route("/account")
@login_required
def account():
	update_email = UpdateEmailForm()
	delete_account = DeleteAccountForm()
	download_account = DownloadDataForm()

	return render_template('user/account.html')


@user_bp.route("/password")
@login_required
def password():
	update_password = UpdatePasswordForm()

	return render_template('user/password.html')
