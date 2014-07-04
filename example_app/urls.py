# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^$', 'example_app.views.index', name='index'),
    url(r'^get_model/(?P<model_name>\w+)', 'example_app.views.get_dynamic_model', name='get_model'),
    url(r'^get_form/(?P<model_name>\w+)', 'example_app.views.get_form', name='get_form'),
    url(r'^get_form/(?P<model_name>\w+)', 'example_app.views.get_form', name='get_form'),
    url(r'^add/(?P<model_name>\w+)', 'example_app.views.add_object', name='add_object'),
    url(r'^update/(?P<model_name>\w+)', 'example_app.views.update_object', name='update_object'),
)

from django.contrib.staticfiles.urls import staticfiles_urlpatterns
urlpatterns += staticfiles_urlpatterns()