# -*- coding: utf-8 -*-
from django_xml_models.models import ModelGenerator
from example_app.settings import BASE_DIR

model_generator = ModelGenerator(BASE_DIR+'/models.xml')
example_models = model_generator.generate_models()