from flask_wtf import FlaskForm
from wtforms import StringField, SubmitField, SelectField, FloatField
from wtforms.validators import DataRequired, Length


class UpdateImageDetailsForm(FlaskForm):
	name = StringField('File Name', validators=[DataRequired(message='Please enter a valid filename'), Length(min=5, max=32)])
	description = StringField('Description', validators=[DataRequired(message='Please enter a description'), Length(min=1, max=256)])
	alt = StringField('Alt-Text', validators=[DataRequired(message='Please enter some alt-text for the image'), Length(min=1, max=192)])
	permission = SelectField('Permission Level', choices=[
		('0', 'Anybody on or off Mappr can view'),
		('1', 'Anybody on Mappr can view'),
		('2', 'Only I can view')
	], validators=[DataRequired(message='Please enter a permission level')])
	submit = SubmitField('Update Image Details')


class UpdateImageLocationForm(FlaskForm):
	lat = FloatField('Latitude', validators=[DataRequired(message='Please enter a valid latitude')])
	lng = FloatField('Longitude', validators=[DataRequired(message='Please enter a valid longitude')])
	submit = SubmitField('Update Image Location')


class DeleteImageForm(FlaskForm):
	submit = SubmitField('Delete Image')
