import json

from django.shortcuts import render
from django.http import HttpResponse
from django.db.models import get_model
from django.core.serializers.json import DjangoJSONEncoder
from django.forms.models import model_to_dict
from django.core.exceptions import ValidationError

from django_xml_models.forms import FormGenerator
from example_app.models import example_models

form_generator = FormGenerator()

def index(request):
	models = [dict([('name', m.__name__), ('title', m._meta.verbose_name.title())]) for m in example_models]
 	return render(request, 'index.html', {'models': models})

def get_dynamic_model(request, model_name):
	if request.is_ajax():
		model = get_model('django_xml_models', model_name)
		obj_query = model.objects.all()
		objects = [model_to_dict(o) for o in obj_query]
		fields = [f.name for f in model._meta.fields]
		types = [f.get_internal_type() for f in model._meta.fields]
		field_types = dict(zip(fields, types))
		field_titles = [f.verbose_name for f in model._meta.fields]
		result = {'objects': objects, 'fields': fields, 'field_titles': field_titles, 'field_types': field_types}
		return HttpResponse(json.dumps(result, cls=DjangoJSONEncoder), content_type='application/json', status=200)
	else:
		return HttpResponse(status=401)

def get_form(request, model_name):
	if request.is_ajax():
		model = get_model('django_xml_models', model_name)
		form = form_generator.create_dynamic_form(model)
		return render(request, 'form.html', {'form': form, 'model_name':model_name})
	else:
		return HttpResponse(status=401)

def add_object(request, model_name):
	if request.is_ajax():
		model = get_model('django_xml_models', model_name)
		form = form_generator.create_dynamic_form(model)
		f = form(request.POST)
		if f.is_valid():
			o = f.save()
			return HttpResponse(json.dumps(model_to_dict(o), cls=DjangoJSONEncoder), content_type='application/json', status=200)
		else:
			return render(request, 'form.html', {'form': f, 'model_name':model_name}, status=400)
	else:
		return HttpResponse(status=401)


def update_object(request, model_name):
	if request.is_ajax():
		model = get_model('django_xml_models', model_name)
		m = model.objects.get(pk=request.POST['pk'])
		field =	request.POST['field']
		value = request.POST['value']
		m.__dict__.update({field: value}) 
		try:
			m.full_clean()
		except ValidationError as e:
			return HttpResponse(json.dumps(e.message_dict, cls=DjangoJSONEncoder), content_type='application/json', status=400)
		m.save(update_fields=[field])
		return HttpResponse(json.dumps('ok'), content_type='application/json', status=200)
	else:
		return HttpResponse(status=401)