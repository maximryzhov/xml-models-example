//Variables for Pure.js template
var fields = null;
var titles = null;
var objects = null;
var fieldsDir = null;
var titlesDir = null;
var objectsDir = null;

var template = '<thead>' +
                '<tr>' +
                '<th class="col-md-4"></th>' +
                '</tr>' +
                '</thead>' +
                '<tbody>' +
                '<tr>' +
                '<td></td>' +
                '</tr>' +
                '</tbody>';

//Bootstrap datapicker options
var dtpckr_opts = {
    todayBtn: 'linked',
    format: 'yyyy-mm-dd',
    autoclose: true,
    language: "ru",
    todayHighlight: true
}

$(document).ready(function () {
    $('.menu-item').on('click', null, function (event) {
        event.preventDefault();
        var model_name = $(this).prop('rel');
        get_model(model_name);
        get_form(model_name);
    });
})

function get_model(model_name) {
    $.ajax({
        url: '/get_model/' + model_name,
        type: "GET",
        success: function (response) {
            populate_table(response, model_name);
        }
    });
}

function populate_table(response, model_name) {
    fields = response['fields'];
    field_titles = response['field_titles'];
    field_types = response['field_types'];
    objects = response['objects'];

    field_mapping = {};
    for (var i = 0; i < fields.length; i++) {
        f = fields[i];
        field_mapping['td.' + f] = 'object.' + f;
    };

    ////Directives for Pure.js rendering
    fieldsDir = {
        'td': {
            'field<-': {
                '@class': 'field',
                '@editable': function (a) {
                    if (a.item != 'id') {
                        return 'true'
                    }
                    else {
                        return 'false'
                    }
                }
            }
        }
    };
    typesDir = {};
    for (var i = 0; i < fields.length; i++) {
        f = fields[i];
        typesDir['td.' + f + '@data-type'] = f;
    };
    titlesDir = {
        'th': {
            'title<-': {
                '.': 'title'
            }
        }
    };
    objectsDir = {
        'td@data-pk': 'object.id',
        'tbody tr': {
            'object<-': field_mapping
        }
    };

    //Rednder table to a hidden element first
    $('#prepare').html(template).render(fields, fieldsDir).render(field_types, typesDir).render(field_titles, titlesDir).render(objects, objectsDir);
    $('#result').hide();
    $('#result').html($('#prepare').html());
    $('#result').fadeIn(300);
    setup_table(model_name);
}

function get_form(model_name) {
    $.ajax({
        url: '/get_form/' + model_name,
        type: "GET",
        success: function (response) {
            $('#form').html(response);
            setup_form();
        }
    });
}

function setup_form() {
    $('.datepicker.dropdown-menu').remove();
    var datefield = $('input.datepicker').datepicker(dtpckr_opts);

    $('form input[type=text], input[type=number]').addClass('form-control');

    $('form').on('submit', null, function (event) {
        event.preventDefault();
        submit_form(event, $(this));
    });
}

function submit_form(event, form) {
    $.ajax({
        type: 'POST',
        url: form.prop('action'),
        data: form.serialize(),

        success: function (response) {
            objects.push(response);
            $('#prepare').html(template).render(fields, fieldsDir).render(field_types, typesDir).render(field_titles, titlesDir).render(objects, objectsDir);
            new_row = $('#prepare tr').last().hide();
            $('#result').append(new_row);
            $('#result tr').last().fadeIn(300);
            $('form')[0].reset();
            $('.form-group').removeClass('has-error');
        },

        statusCode: {
            400: function (response) {
                $('#form').html(response.responseText);
                setup_form();
            },
            500: function (response) {
                $('form').after('<div id="form-error" class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>Unknown error</div>');
                setTimeout(function() {
                    $('#form-error').remove();
                }, 1000)
            },
        }
    });
}

function setup_table(model_name) {
    $('#result thead tr').children('th').first().addClass('col-md-1');
    $('td[editable="true"]').on('dblclick', null, function () {

        var cell = $(this);
        var old_value = cell.text();
        var data_type = cell.attr('data-type');

        cell.html('<input type="text" value="' + old_value + '" />');

        //Prevent clearing input with double-click
        cell.children().first().on('dblclick', null, function (e) {
            cell.text(old_value);
        });

        //Date field needs different behaviour because of Datepicker callbacks
        if (data_type == "DateField") {
            var datefield = cell.children().first().datepicker(dtpckr_opts).on('hide', function (ev) {
                var new_value = cell.children().val();
                if (new_value !== old_value) {
                    update = update_cell(cell, new_value, model_name);
                } else {
                    cell.text(old_value);
                }
            }).data('datepicker');
            cell.children().first().focus();
        } else {
            cell.children().first().focus();
            cell.children().first().keypress(function (e) {
                if (e.which == 13) {
                    var new_value = $(this).val();
                    if (new_value !== old_value) {
                        update = update_cell(cell, new_value, model_name);
                    } else {
                        cell.text(old_value);
                    }
                }
            });
            cell.children().first().blur(function () {
                cell.text(old_value);
            });
        }

    });
}

function update_cell(cell, new_value, model_name) {
    field = (cell.prop('class'));
    pk = (cell.attr('data-pk'));
    csrf_token = $('form input[name="csrfmiddlewaretoken"]').val();

    $.ajax({
        url: '/update/' + model_name,
        type: "POST",
        data: {
            'pk': pk,
            'field': field,
            csrfmiddlewaretoken: csrf_token,
            'value': new_value
        },
        success: function (response) {
            cell.text(new_value);
        },

        statusCode: {
            400: function (response) {
                show_popover(cell.children().first(), response.responseText);
            },
            500: function (response) {
                message = 'Unknown Error';
                show_popover(cell.children().first(), message);
            }
        },
    });

}

function show_popover(target, message) {
    target.popover('destroy');
    error_popover = target.popover({
        placement: 'above',
        html: true,
        offset: 80,
        trigger: 'manual',
        content: '<span class="error">' + message + '</span>',
    });
    target.popover('show');
}