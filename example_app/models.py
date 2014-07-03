# -*- coding: utf-8 -*-
from django_xml_models.models import ModelGenerator

model_generator = ModelGenerator('models.xml')
example_models = model_generator.generate_models()