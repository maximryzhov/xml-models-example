# -*- coding: utf-8 -*-
from StringIO import StringIO

from django.test import TestCase
from django.db import models

from django_xml_models.models import ModelGenerator

class ModelTestCase(TestCase):
    def prepare_model(self):
        xml_string = '<?xml version="1.0" encoding="UTF-8"?><root><model name="Users" title="Пользователи"><field id="name" type="char" title="Имя" /><field id="paycheck" type="int" title="Зарплата" /><field id="date_joined" type="date" title="Дата присоединения" /></model></root>'
        test_model_generator = ModelGenerator(StringIO(xml_string))
        return test_model_generator.generate_models()[0]

    def test_model_is_created(self):
        test_model = self.prepare_model()
        self.assertIsNotNone(test_model)

    def test_model_name_is_correct(self):
        test_model = self.prepare_model()
        self.assertEqual(test_model.__name__, 'Users')

    def test_model_title_is_correct(self):
        test_model = self.prepare_model()
        self.assertEqual(test_model._meta.verbose_name.title(), ('Пользователи').decode('utf-8'))

    def test_fields_are_created(self):
        test_model = self.prepare_model()
        self.assertIn('name', [f.name for f in test_model._meta.fields])
        self.assertIn('paycheck', [f.name for f in test_model._meta.fields])
        self.assertIn('date_joined', [f.name for f in test_model._meta.fields])

    def test_field_types_are_correct(self):
        test_model = self.prepare_model()
        self.assertIsInstance(test_model._meta.get_field('name'), models.CharField)
        self.assertIsInstance(test_model._meta.get_field('paycheck'), models.IntegerField)
        self.assertIsInstance(test_model._meta.get_field('date_joined'), models.DateField)

    def test_field_titles_are_correct(self):
        test_model = self.prepare_model()
        self.assertEqual(test_model._meta.get_field('name').verbose_name.title(), ('Имя').decode('utf-8'))
        self.assertEqual(test_model._meta.get_field('paycheck').verbose_name.title(), ('Зарплата').decode('utf-8'))
        self.assertTrue(test_model._meta.get_field('date_joined').verbose_name.title(), ('Дата присоединения').decode('utf-8'))
    
