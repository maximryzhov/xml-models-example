# -*- coding: utf-8 -*-
from lxml import etree

def check_xml(xml_root):
	for model_node in xml_root:
		attribs = ('name', 'title')
		for a in attribs:
			if a not in model_node.attrib:
				raise RuntimeError('Attribute "%s" is not defined in XML file on line %s' % (a, model_node.sourceline))
		for field_node in model_node:
			attribs = ('id', 'type', 'title')
			for a in attribs:
				if a not in field_node.attrib:
					raise RuntimeError('Attribute "%s" for model "%s" is not defined in XML file on line %s' % (a, model_node.attrib['title'], field_node.sourceline))
			types = ('char', 'int', 'date')
			if field_node.attrib['type'] not in types:
				raise RuntimeError('Unsupported type value: "%s" in XML file on line %s' % (field_node.attrib['type'], field_node.sourceline))

def parse_xml(xml_doc):
	xml_models = []
	xml_tree = etree.parse(xml_doc)
	xml_root = xml_tree.getroot()
	check_xml(xml_root)
	for model_node in xml_root:
		model_ = dict(model_node.attrib)
		model_['fields'] = []
		for field_node in model_node:
			model_['fields'].append(dict(field_node.attrib))
		xml_models.append(model_)
	return xml_models