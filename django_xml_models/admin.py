# -*- coding: utf-8 -*-
from django.db.models import get_models
from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered

from django_xml_models import models

def autoregister():
	for model in get_models(models):
		if model._meta.abstract == False:
			try:
				admin.site.register(model)
			except AlreadyRegistered:
				pass
				
autoregister()