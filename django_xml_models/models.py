# -*- coding: utf-8 -*-
from django.db import models
from django_xml_models.utils import parse_xml

from example_project.settings import BASE_DIR

class ModelGenerator(object):
	def __init__(self, xml_doc):
		self.xml_models_list = parse_xml(xml_doc)

	def setup_field(self, field):
		options = {
		'char' : models.CharField(max_length=255, verbose_name=field['title']),
		'int' : models.IntegerField(verbose_name=field['title']),
		'date' : models.DateField(verbose_name=field['title']),
		}
		return options[field['type']]

	def set_model_title(self, xml_model):
		for field in xml_model['fields']:
			if field['type'] == 'char':
				return lambda self: u'%s' % self.__dict__[field['id']]
		return lambda self: u'%s №%d' % (xml_model['title'], self.id)

	def create_dynamic_models(self):
		for xml_model in self.xml_models_list:
			meta=type('Meta', (), {'verbose_name': xml_model['title'], 'verbose_name_plural': xml_model['title']})
			attrs = {'__module__': self.__module__, '__unicode__': self.set_model_title(xml_model), "Meta": meta}
			for field in xml_model['fields']:
				attrs.update({field['id'] : self.setup_field(field)})
			model = type(xml_model['name'], (models.Model,), attrs)
			globals()[model.__name__] = model
			yield model

	def generate_models(self):
		return list(self.create_dynamic_models())

example_model_generator = ModelGenerator(BASE_DIR+'/models.xml')
example_models = example_model_generator.generate_models()