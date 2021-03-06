var HtmlElement = require('./html/HtmlElement'),
    Input = require('./input'),
    events = require('events');

function Form(attributes, formData) {
    this.setTagName('form');
    this.formData = formData;
    this.formTag = new HtmlElement('form');
    this._nameHolder = {};
    
    if (attributes !== undefined) {
        this.formTag.attr(attributes);
    }
    
    // mixin
    var emitter = new events.EventEmitter;
    for (var i in emitter) {
        this[i] = emitter[i];
    }
}

Form.prototype = Object.create(HtmlElement.prototype);
Form.prototype.constructor = Form;

/**
 * Keep inputs in arrays to render when call renderAll()
 */
Form.prototype.elements = [];

/**
 * Input wrapper tags
 */
Form.prototype.inputWrapperTagOpen = "";
Form.prototype.inputWrapperTagClose = "";


/**
 *Creates a input of type {inputType}
 *
 *@param {String} inputType
 * Optional The type of entry you wanna create, for example:
 *- text
 *- checkbox
 *- radio
 *- select
 *
 *@return {Input}
 **/
Form.prototype.input = function(inputType){
    var input;
    
    if (Input[inputType] !== undefined) {
        input = new Input[inputType](this);
    }else{
        input = new Input.input(this);
        
        if (inputType !== undefined) {
            input.attr('type', inputType);
        }
    }

    /**
     * Save the input on array
     */
    this.elements.push(input);

    return input;
};

Form.prototype.getValueFor = function(input){
    if (this.formData && input.attr('name') !== undefined) {
        var names = input.getNormalizedNames(),
            allData = this.getFormData(),
            currentName,
            response = allData,
            isCheckbox = input.attr('type') == 'checkbox', // only checkboxes and select multiples can be multi selectable
            isSelectMultiple = input.getTagName() == 'select' && input.attr('multiple') == 'multiple',
            isMultiSelectable = (isCheckbox || isSelectMultiple);
            
        if (isCheckbox || isSelectMultiple && names.length > 1) {
            names.pop();
        }
        
        while (currentName = names.shift()) {
            if (response[currentName] !== undefined) {
                response = response[currentName];
            }else{
                return undefined;
            }
        }
        return response;
    }
};

Form.prototype.getFormData = function(){
    return this.formData;
};

Form.prototype.setFormData = function(data){
    this.formData = data;
};

Form.prototype.render = function(){
    return this.formTag.renderOpen();
};

Form.prototype.end = function(){
    return this.formTag.renderEnd();
};

/**
 * Input wrapper (used on twitter Bootstrap)
 */
Form.prototype.setInputWrapper = function(openTag,closeTag) {

    if(openTag !== "" && closeTag !== "") {
        this.inputWrapperTagOpen = openTag;
        this.inputWrapperTagClose = closeTag;
    }
};

/**
 * Render all elements
 * @return string Rendered form
 */
Form.prototype.renderAll = function() {
    var rendered = '';

    /**
     * Open form tag
     */
    rendered += this.render();

    /**
     * Render elements
     */
    for(var i in this.elements) {
        var element = this.elements[i];

        /**
         * Render the input wrapper if have
         */
        if(this.inputWrapperTagOpen !== "" && this.inputWrapperTagClose !== "") {
            rendered += this.inputWrapperTagOpen;
            rendered += element.render();
            rendered += this.inputWrapperTagClose;
        }else {
            rendered += element.render();
        }
        
    }

    /**
     * Close form tag
     */
    rendered += this.end();

    return rendered;
    
};

Form.create = function(attributes, formData){
    return new Form(attributes, formData);
};

Form._dynamiclyCreateType = [
    'textarea',
    'select',
    'radio',
    'checkbox',
    'button',
    'color',
    'date',
    'datetime',
    'datetimeLocal',
    'email',
    'file',
    'hidden',
    'image',
    'month',
    'number',
    'password',
    'range',
    'reset',
    'search',
    'submit',
    'tel',
    'text',
    'time',
    'url',
    'week'
];


for (var i in Form._dynamiclyCreateType) {
    (function(typeName){
        Form.prototype[typeName] = function(){
            return this.input(typeName);
        };
    })(Form._dynamiclyCreateType[i]);
}

module.exports = Form;