# -*- coding: utf-8 -*-
from django import forms
from django.db import models

class FormGenerator(object):
	def create_dynamic_form(self, model):
		meta = type('Meta', (), { "model":model, })
		modelform_class = type('modelform', (forms.ModelForm,), {"Meta": meta,})
		inputs = [models.CharField, models.IntegerField]
		#Add some styling for Bootstrap
		for f in model._meta.fields:
			if type(f) in inputs:
				modelform_class.base_fields[f.name].widget.attrs['class'] = 'form-control'
			if type(f) == models.DateField:
				modelform_class.base_fields[f.name].widget.attrs['class'] = 'datepicker form-control'
		return modelform_class