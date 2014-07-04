from django.test import TestCase
from example_app.models import example_models

class ViewsTestCase(TestCase):
    def test_index(self):
        resp = self.client.get('/')
        for m in example_models:
        		m.__name__ in [d['name'] for d in resp.context['models']]
        		self.assertEqual(resp.status_code, 200)

    def test_get_model(self):
    	for m in example_models:
			resp = self.client.get('/get_model/%s' % m.__name__) 
			self.assertEqual(resp.status_code, 401)

    def test_get_model_ajax(self):
		for m in example_models:
			resp = self.client.get('/get_model/%s' % m.__name__) 
			self.assertEqual(resp.status_code, 401)