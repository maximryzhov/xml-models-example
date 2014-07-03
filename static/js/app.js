$(document).ready(function(){
	
	$('.menu-item').on('click', null, function(event){
		event.preventDefault();
		$(this).toggleClass("active");
		$('#result').html('<thead><tr><th></th></tr></thead><tbody><tr><td pk=""></td></tr></tbody>');
		var model_name = $(this).attr('rel');
		$.ajax({
		    url:'/get_model/' + model_name,
		    type:"GET",
		    success:function (response){
		    	populate_table(response);
		    }
		});

		$('#form').load('/get_form/' + model_name, function () {
			$('.datepicker').datepicker({format: 'mm-dd-yyyy'});			
		});

	});

})

function populate_table(response){

	fields = response['fields'];
	titles = response['titles'];
	objects = response['objects'];

	field_mapping = {};
	for (var i = 0; i < fields.length; i++) {
		f = fields[i];
		field_mapping['td.'+ f] = 'object.'+ f;
	};

	fieldsDir = {'td':{'field<-':{'@class':'field'}}};
	titlesDir = {'th':{'title<-':{'.':'title'}}}
	objectsDir = {'td@pk':'object.id', 'tbody tr':{'object<-':field_mapping}};

	$('#result').render(fields, fieldsDir).render(titles, titlesDir).render(objects, objectsDir);
}