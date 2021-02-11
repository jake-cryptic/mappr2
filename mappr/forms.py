from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField, SelectField, BooleanField, DecimalField, TextAreaField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError, Regexp, NumberRange


class CreateUserForm(FlaskForm):
	create_name = StringField('Name', validators=[DataRequired(), Length(min=1, max=50)])
	create_email = StringField('Email', validators=[DataRequired(), Email()])
	create_password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Create Account')


class LoginUserForm(FlaskForm):
	login_email = StringField('Email', validators=[DataRequired(), Email()])
	login_password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Login')


class UpdateEmailForm(FlaskForm):
	uef_email = StringField('New Email', validators=[DataRequired(), Email()])
	uef_password = PasswordField('Current Password', validators=[DataRequired()])
	submit = SubmitField('Update Email')


class UpdatePasswordForm(FlaskForm):
	upf_old_password = PasswordField('Current Password', validators=[DataRequired(), Length(min=8, max=255)])
	upf_new_password = PasswordField('New Password', validators=[DataRequired(), Length(min=8, max=255)])
	upf_confirm_password = PasswordField('Confirm New Password', validators=[DataRequired(), EqualTo('new_password')])
	submit = SubmitField('Update Password')


class DeleteAccountForm(FlaskForm):
	daf_password = PasswordField('Account Password', validators=[DataRequired(), Length(min=8, max=255)])
	daf_confirm = BooleanField('Are you sure?', validators=[DataRequired()])
	submit = SubmitField('Delete Account')


class DownloadDataForm(FlaskForm):
	ddf_password = PasswordField('Account Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Download Data')
