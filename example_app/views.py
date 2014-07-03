import json

from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import get_model
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict

from django_xml_models.forms import FormGenerator
from example_app.models import example_models

def index(request):
	models = [dict([('name', m.__name__), ('title', m._meta.verbose_name.title())]) for m in example_models]
 	return render(request, 'index.html', {'models': models})

def get_dynamic_model(request, model_name):
	model = get_model('django_xml_models', model_name)
	obj_query = model.objects.all()
	objects = [model_to_dict(o) for o in obj_query]
	fields = [f.name for f in model._meta.fields]
	titles = [f.verbose_name for f in model._meta.fields]
	result = {'objects': objects, 'fields': fields, 'titles': titles}
	return HttpResponse(json.dumps(result, cls=DjangoJSONEncoder), content_type='application/json')

def get_form(request, model_name):
	form_generator = FormGenerator()
	model = get_model('django_xml_models', model_name)
	form = form_generator.create_dynamic_form(model)
	return render(request, 'form.html', {'form': form})