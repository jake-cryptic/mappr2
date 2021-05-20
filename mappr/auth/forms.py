from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, Length, Email


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
