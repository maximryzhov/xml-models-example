var fields = null;
var titles = null;
var objects = null;
var fieldsDir = null;
var titlesDir = null;
var objectsDir = null;

var template = '<thead><tr><th></th></tr></thead><tbody><tr><td pk=""></td></tr></tbody>';

$(document).ready(function(){	
	$('.menu-item').on('click', null, function(event){
		event.preventDefault();
		var model_name = $(this).attr('rel');
		get_model(model_name);
		get_form(model_name);
	});
})

function get_model(model_name) {
	$.ajax({
	    url:'/get_model/' + model_name,
	    type:"GET",
	    success:function (response){
	    	populate_table(response, model_name);
	    }
	});
}

function populate_table(response, model_name){
	fields = response['fields'];
	titles = response['titles'];
	objects = response['objects'];
	//Map fields to table cells
	field_mapping = {};
	for (var i = 0; i < fields.length; i++) {
		f = fields[i];
		field_mapping['td.'+ f] = 'object.'+ f;
	};
	//Directives for Pure.js
	fieldsDir = {'td':{'field<-':{'@class':'field'}}};
	titlesDir = {'th':{'title<-':{'.':'title'}}}
	objectsDir = {'td@pk':'object.id', 'tbody tr':{'object<-':field_mapping}};
	//Render table
	$('#prepare').html(template).render(fields, fieldsDir).render(titles, titlesDir).render(objects, objectsDir);
	$('#result').hide();
	$('#result').html($('#prepare').html());
	$('#result').fadeIn(300);
}

function get_form(model_name) {
	$.ajax({
	    url:'/get_form/' + model_name,
	    type:"GET",
	    success:function (response){
	    	$('#form').html(response);
	    	setup_form();
	    }
	});
}

function setup_form () {
	//Prevent datepicker from creating multiple dropdowns
	$('.datepicker.dropdown-menu').remove();
	var datefield = $('input.datepicker').datepicker({format: 'yyyy-mm-dd'}).on('changeDate', function(ev) {
		datefield.hide();
	}).data('datepicker');
	//Add bootstrap styles
	$('form input[type=text], input[type=number]').addClass('form-control');
	$('form').on('submit', null, function (event) {
		event.preventDefault();
		submit_form(event, $(this));
	});
}

function submit_form (event, form) {
    $.ajax({
        type:'POST',
        url: form.attr('action'),
        data: form.serialize(),
        success: function(response){
		objects.push(response);
		$('#prepare').html(template).render(fields, fieldsDir).render(titles, titlesDir).render(objects, objectsDir);
		new_row = $('#prepare tr').last().hide();
		$('#result').append(new_row);
		$('#result tr').last().fadeIn(300);
		$('form')[0].reset();
        },
        statusCode: {
	        400: function(response) {
	        	$('#form').html(response.responseText);
	        	setup_form();
	        }
        }
    });
}