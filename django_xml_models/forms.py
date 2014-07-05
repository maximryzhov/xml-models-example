# -*- coding: utf-8 -*-
from django import forms
from django.db import models

class FormGenerator(object):
	def create_dynamic_form(self, model):
		meta = type('Meta', (), { "model":model, })
		modelform_class = type('modelform', (forms.ModelForm,), {"Meta": meta,})
		for f in model._meta.fields:
			if type(f) == models.DateField:
				modelform_class.base_fields[f.name].widget.attrs['class'] = 'date-field'
		return modelform_class