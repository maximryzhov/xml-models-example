//Global vars
var modelName = null;

var formHTML = null;
var formWrapper = null;

var hiddenDOM = null;
var targetDOM = null;
var template = null;
var dir = {};

var datePickerOptions = null;

//Init functions
function Init () {
    initMenuTabs();
    initTemplate();
    initDatePicker();

    formWrapper = $('#form-wrapper');
    hiddenDOM = $('#prepare');
    targetDOM = $('#result');

}

//Set Bootstrap Datepicker options
function initDatePicker() {
    datePickerOptions = {
        todayBtn: 'linked',
        format: 'yyyy-mm-dd',
        autoclose: true,
        language: "ru",
        todayHighlight: true
    }
}

function initMenuTabs() {
    $('.menu-item').on('click', null, function (event) {
        event.preventDefault();
        modelName = $(this).attr('data-model');
        getModelObjects();
        getModelForm();   
    });
}

function initTemplate() {
    template = '<thead>' +
                    '<tr>' +
                    '   <th class="col-md-4""></th>' +
                    '</tr>' +
                '</thead>' +
                '<tbody>' +
                    '<tr>' +
                        '<td></td>' +
                    '</tr>' +
                '</tbody>';
}

//Directives for Pure.js library
function initDirectives(data) {
modelObjects = data['objects'];
modelFields = data['fields'];
fieldTitles = data['field_titles'];
fieldTypes = data['field_types'];

    dir['modelFields'] = {
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

    dir['fieldTitles'] = {
        'th': {
            'title<-': {
                '.': 'title'
            }
        }
    };

    dir['fieldTypes'] = {};
    for (var i = 0; i < modelFields.length; i++) {
        f = modelFields[i];
        dir['fieldTypes']['td.' + f + '@data-type'] = f;
    };

    fieldMapping = {};
    for (var i = 0; i < modelFields.length; i++) {
        f = modelFields[i];
        fieldMapping['td.' + f] = 'object.' + f;
    };

    dir['modelObjects'] = {
        'td@data-pk': 'object.id',
        'tbody tr': {
            'object<-': fieldMapping
        }
    };
}

//AJAX functions
function getModelObjects() {
    $.ajax({
        url: '/get_model/' + modelName,
        type: "GET",
        success: function (response) {
            initDirectives(response);
            renderTable(dir);
        }
    });
    
}

function addObject(event, form) {
   $.ajax({
        type: 'POST',
        url: form.prop('action'),
        data: form.serialize(),

        success: function (response) {
            modelObjects.push(response);
            renderTable(dir);
            $('form')[0].reset();
            $('.form-group').removeClass('has-error');
            setupTable();
        },

        statusCode: {
            400: function (response) {
            $('#form-wrapper').html(response.responseText);
                setupModelForm();
                message = 'Форма заполнена некорректно';
                renderErrorAlert(message);
            },

        },

        error : function (response) {
                message = 'Неизвестная ошибка';
                renderErrorAlert(message);
            }

    });
}

function updateObject(cell, newValue, modelName) {
    field = (cell.prop('class'));
    pk = (cell.attr('data-pk'));
    csrf_token = $('form input[name="csrfmiddlewaretoken"]').val();

    $.ajax({
        url: '/update/' + modelName,
        type: "POST",
        data: {
            'pk': pk,
            'field': field,
            csrfmiddlewaretoken: csrf_token,
            'value': newValue
        },
        success: function () {
            cell.text(newValue);
        },

        statusCode: {
            400: function () {
                renderErrorPopover(cell.children().first(), 'Недопустимое значение');       
            }
            
        },

        error: function () {
            message = 'Неизвестная ошибка';
            renderErrorPopover(cell.children().first(), message);
        }
    });
}

function getModelForm() {
     $.ajax({
        url: '/get_form/' + modelName,
        type: "GET",
        success: function (response) {
            formHTML = response
            renderModelForm();
            setupModelForm();
        }
    });   
}

//Render functions
function renderTable(dir) {
    var result = hiddenDOM.html(template).render(modelFields, dir['modelFields']).render(fieldTypes, dir['fieldTypes']).render(fieldTitles, dir['fieldTitles']).render(modelObjects, dir['modelObjects']);
    targetDOM.html(result.html());
    setupTable();
}

function renderModelForm() {
    formWrapper.html(formHTML);
}

function renderErrorAlert(message) {
    $('form').after('<div id="form-error" class="alert alert-danger" role="alert"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'+ message + '</div>');
    setTimeout(function() {
    $('#form-error').remove();
    }, 2000)
}

function renderErrorPopover (target, message) {
    target.popover('destroy');
    errorPopover = target.popover({
        placement: 'above',
        html: true,
        offset: 80,
        trigger: 'manual',
        content: '<span class="error">' + message + '</span>',
    });
    target.popover('show');
}

//Setup functions
function setupModelForm() {
    $('.datepicker.dropdown-menu').remove();
    $('input.date-field').datepicker(datePickerOptions);

    $('#form-wrapper form').find('input[type=text], input[type=number]').addClass('form-control');

    $('#form-wrapper form').on('submit', null, function (event) {
        event.preventDefault();
        addObject(event, $(this));
    });
}

function setupTable() {
    targetDOM.find('th').first().addClass('col-md-1');
    $('td[editable="true"]').on('dblclick', null, function () {

        var cell = $(this);
        var oldValue = cell.text();
        var dataType = cell.attr('data-type');

        if (dataType == "IntegerField") {
            cell.html('<input type="number" value="' + oldValue + '" />');
            handleCellEditing(cell, oldValue);
        }

        if (dataType == "CharField") {
            cell.html('<input type="text" value="' + oldValue + '" />');
            handleCellEditing(cell, oldValue);
        }

        if (dataType == "DateField") {
            cell.html('<input type="text" value="' + oldValue + '" />');
            var datefield = cell.children().first().datepicker(datePickerOptions).on('hide', function (ev) {
                var newValue = cell.children().val();
                if (newValue !== oldValue) {
                    update = updateObject(cell, newValue, modelName);
                } else {
                    cell.text(oldValue);
                }
            }).data('datepicker');
        handleCellEditing(cell, oldValue);            
        }
        cell.children().first().focus();

    });
}

//Handle functions
function handleCellEditing(cell, oldValue) {
    cell.children().first().focus();
    cell.children().first().on('dblclick', null, function (e) {
        cell.text(oldValue);
    });
    cell.children().first().blur(function () {
        cell.text(oldValue);
    });

    cell.children().first().keypress(function (e) {
        if (e.which == 13) {
            var newValue = $(this).val();
            if (newValue !== oldValue) {
                update = updateObject(cell, newValue, modelName);
            } else {
                cell.text(oldValue);
            }
        }
    });
 } 

//finally
$(document).ready(function () {
    Init();
});