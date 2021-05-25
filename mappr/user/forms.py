from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, SelectField, BooleanField
from wtforms.validators import DataRequired, Length, Email, EqualTo


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
	export = SelectField('Export', choices=[('node_locations', 'Personal mast move history'), ('bookmarks', 'Personal location bookmarks'), ('gallery_files', 'Mast Pictures uploaded'), ('map_files', 'Map Files uploaded')], validators=[DataRequired(message='Please enter an export type')])
	password = PasswordField('Account Password', validators=[DataRequired(message='Please enter your password'), Length(min=8, max=255)])
	submit = SubmitField('Download Data')
