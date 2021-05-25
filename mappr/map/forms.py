from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField
from wtforms.validators import DataRequired, Length


class UpdateFileDetailsForm(FlaskForm):
	name = StringField('File Name', validators=[DataRequired(message='Please enter a valid filename'), Length(min=5, max=32)])
	description = StringField('Description', validators=[DataRequired(message='Please enter a description'), Length(min=1, max=256)])
	permission = SelectField('Permission Level', choices=[
		('0', 'Anybody on Mappr can view'),
		('1', 'Only I can view')
	], validators=[DataRequired(message='Please enter a permission level')])
	submit = SubmitField('Update File Details')
