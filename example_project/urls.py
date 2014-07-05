# -*- coding: utf-8 -*-
from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    
    url(r'^$', 'django_xml_models.views.index', name='index'),
    url(r'^get_model/(?P<model_name>\w+)', 'django_xml_models.views.get_dynamic_model', name='get_model'),
    url(r'^get_form/(?P<model_name>\w+)', 'django_xml_models.views.get_form', name='get_form'),
    url(r'^add/(?P<model_name>\w+)', 'django_xml_models.views.add_object', name='add_object'),
    url(r'^update/(?P<model_name>\w+)', 'django_xml_models.views.update_object', name='update_object'),
)


urlpatterns += staticfiles_urlpatterns()