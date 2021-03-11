from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField, SelectField, BooleanField, DecimalField, TextAreaField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError, Regexp, NumberRange


# TODO: Move these forms to their relevant folders
class CreateUserForm(FlaskForm):
	name = StringField('Name', validators=[DataRequired(message='Please enter a name'), Length(min=1, max=50)])
	email = StringField('Email', validators=[DataRequired(message='Please enter an email'), Email(message='Please enter a valid email')])
	password = PasswordField('Password', validators=[DataRequired(message='Please enter a password'), Length(min=8, max=255, message='Password does not meet length requirements')])
	submit = SubmitField('Request Access')


class LoginUserForm(FlaskForm):
	email = StringField('Email', validators=[DataRequired(message='Please enter your email'), Email(message='Please enter a valid email')])
	password = PasswordField('Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255, message='Password does not meet length requirements')])
	# remember_me = Checkbox
	submit = SubmitField('Login')


class ReAuthUserForm(FlaskForm):
	password = PasswordField('Account Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255, message='Password does not meet length requirements')])
	submit = SubmitField('Re-Authenticate')


class UpdateEmailForm(FlaskForm):
	email = StringField('Email Address', validators=[DataRequired(message='Please enter a new email address'), Email(message='Please enter a valid email')])
	password = PasswordField('Current Password', validators=[DataRequired(message='Please enter your password')])
	submit = SubmitField('Update Email')


class UpdatePasswordForm(FlaskForm):
	old_password = PasswordField('Current Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255)])
	new_password = PasswordField('New Password', validators=[DataRequired(message='Please enter a new password'), Length(min=8, max=255, message='Ensure your new password meets the length requirements')])
	confirm_password = PasswordField('Confirm New Password', validators=[DataRequired(message='Please confirm your new password'), EqualTo('new_password', message='Ensure the passwords match')])
	submit = SubmitField('Update Password')


class DeleteAccountForm(FlaskForm):
	password = PasswordField('Account Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255)])
	confirm = BooleanField('Are you sure?', validators=[DataRequired(message='Please confirm your consent')])
	submit = SubmitField('Delete Account')


class DownloadDataForm(FlaskForm):
	password = PasswordField('Account Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255)])
	submit = SubmitField('Download Data')
