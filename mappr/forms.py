from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, IntegerField, SelectField, BooleanField, DecimalField, TextAreaField
from wtforms.validators import DataRequired, Length, Email, EqualTo, ValidationError, Regexp, NumberRange


# TODO: Move these forms to their relevant folders
class CreateUserForm(FlaskForm):
	name = StringField('Name', validators=[DataRequired(), Length(min=1, max=50)])
	email = StringField('Email', validators=[DataRequired(), Email()])
	password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Create Account')


class LoginUserForm(FlaskForm):
	email = StringField('Email', validators=[DataRequired(), Email()])
	password = PasswordField('Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Login')


class UpdateEmailForm(FlaskForm):
	email = StringField('Email Address', validators=[DataRequired(), Email()])
	password = PasswordField('Current Password', validators=[DataRequired()])
	submit = SubmitField('Update Email')


class UpdatePasswordForm(FlaskForm):
	old_password = PasswordField('Current Password', validators=[DataRequired(), Length(min=8, max=255)])
	new_password = PasswordField('New Password', validators=[DataRequired(), Length(min=8, max=255)])
	confirm_password = PasswordField('Confirm New Password', validators=[DataRequired(), EqualTo('new_password')])
	submit = SubmitField('Update Password')


class DeleteAccountForm(FlaskForm):
	password = PasswordField('Account Password', validators=[DataRequired(), Length(min=8, max=255)])
	confirm = BooleanField('Are you sure?', validators=[DataRequired()])
	submit = SubmitField('Delete Account')


class DownloadDataForm(FlaskForm):
	password = PasswordField('Account Password', validators=[DataRequired(), Length(min=8, max=255)])
	submit = SubmitField('Download Data')
