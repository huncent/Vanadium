/*
=====================================================================
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

1. Redistributions of source code must retain the above
copyright notice, this list of conditions and the following
disclaimer.

2. Redistributions in binary form must reproduce the above
copyright notice, this list of conditions and the following
disclaimer in the documentation and/or other materials provided
with the distribution.

3. The name of the author may not be used to endorse or promote
products derived from this software without specific prior
written permission.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS
OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

@author Daniel Kwiecinski <daniel.kwiecinski@lambder.com>
@copyright 2009 Daniel Kwiecinski.
@end
=====================================================================
*/


//-------------------- vanadium-jquery.js -----------------------------


Vanadium = {};
Vanadium.Version = '0.1';
Vanadium.CompatibleWithJQuery = '1.3.2';
Vanadium.Type = "jquery";

if ($().jquery.indexOf(Vanadium.CompatibleWithJQuery) != 0 && window.console && window.console.warn)
  console.warn("This version of Vanadium is tested with jQuery " + Vanadium.CompatibleWithJQuery +
               " it may not work as expected with this version (" + $().jquery + ")");

Vanadium.each = $.each;

Vanadium.all_elements = function(){
  return $('*');
};

Vanadium.partition = function(elements, dyscriminator){
  var left = [];
  var right = [];
  Vanadium.each(elements, function(){
    if(dyscriminator(this)){
      left.push(this);
    }else{
      right.push(this);
    };
  });
  return [left, right];
};




//-------------------- vanadium-container.js -----------------------------


ContainerValidation = function(html_element) {
  this.initialize(html_element)
};

ContainerValidation.prototype = {
  initialize: function(html_element) {
    this.html_element = html_element;
    this.elements = [];
  },
  add_element: function(element) {
    this.elements.push(element);
  },
  decorate: function() {
    var valid = true;
    for (id in this.elements) {
      if (this.elements[id].invalid) {
        valid = false;
        break;
      };
    };
    if (valid) {
      $(this.html_element).removeClass(Vanadium.config.invalid_class);
      $(this.html_element).addClass(Vanadium.config.valid_class);
    } else {
      $(this.html_element).removeClass(Vanadium.config.valid_class);
      $(this.html_element).addClass(Vanadium.config.invalid_class);
    };
  }
};

//-------------------- vanadium-base.js -----------------------------

/*
 =====================================================================
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 1. Redistributions of source code must retain the above
 copyright notice, this list of conditions and the following
 disclaimer.

 2. Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided
 with the distribution.

 3. The name of the author may not be used to endorse or promote
 products derived from this software without specific prior
 written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS
 OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 @author Daniel Kwiecinski <daniel.kwiecinski@lambder.com>
 @copyright 2009 Daniel Kwiecinski.
 @end
 =====================================================================
 */
Vanadium.containers = {};
Vanadium.validators_types = {};
Vanadium.elements_validators = {};
Vanadium.created_advices = [];

Vanadium.extend = function(extension) {
  var args = [Vanadium];
  for (var idx = 0; idx < arguments.length; idx++) {
    args.push(arguments[idx]);
  }
  ;
  return $.extend.apply($, args);
};

Vanadium.bind = function(fun, context) {
  return function() {
    return fun.apply(context, arguments);
  };
};

//default config
Vanadium.config = {
  valid_class: '-v-valid',
  invalid_class: '-v-invalid',
  prefix: ':',
  separator: ';'
};

Vanadium.empty_advice_marker_class = '-vanadium-empty-advice-';

Vanadium.init = function() {
  this.setupValidatorTypes();
  this.scan_dom();
};

Vanadium.addValidatorType = function(className, validationFunction, message, error_message) {
  this.validators_types[className] = new Vanadium.Type(className, validationFunction, message, error_message);
};

Vanadium.addValidatorTypes = function(validators_args) {
  var self = this;
  Vanadium.each(validators_args,
          function() {
            Vanadium.addValidatorType.apply(self, this);
          });
};


Vanadium.scan_dom = function() {
  Vanadium.each(Vanadium.all_elements(),
          function(_idx, child) {

            var class_names = child.className.split(' ');
            if (Vanadium.is_input_element(child)) {
              var element_validation = new ElementValidation(child);

              Vanadium.elements_validators[child.id] = element_validation;

              Vanadium.each(class_names,
                      function() {
                        Vanadium.add_validation_instance(element_validation, this/*class_name*/);
                        Vanadium.add_validation_modifier(element_validation, this/*class_name*/);
                      });
              element_validation.setup();
            } else {
              Vanadium.add_validation_container(child);
            }
            ;
          })
};

Vanadium.add_validation_container = function(element) {
  var class_names = element.className.split(' ');
  Vanadium.each(class_names,
          function() {
            if (this.indexOf(Vanadium.config.prefix + 'container') == 0) {
              Vanadium.containers[element.id] = new ContainerValidation(element);
              return true;
            }
            ;
          });
};

Vanadium.add_validation_instance = function(element_validation, class_name) {
  if (class_name.indexOf(Vanadium.config.prefix) == 0) {
    var v_params = class_name.substr(Vanadium.config.prefix.length).split(Vanadium.config.separator)
    var v_name = v_params[0];
    var v_param = (v_params[1] === "" ? undefined : v_params[1]);
    var v_advice_id = v_params[2];
    var validator_type = Vanadium.validators_types[v_name];
    if (validator_type) {
      element_validation.add_validation_instance(validator_type, v_param, v_advice_id);
    }
    ;
  }
  ;
};

Vanadium.add_validation_modifier = function(element_validation, class_name) {
  if (class_name == Vanadium.config.prefix + 'only_on_blur' || class_name == Vanadium.config.prefix + 'only_on_submit' || class_name.indexOf(Vanadium.config.prefix + 'wait') == 0) {
    var v_params = class_name.substr(Vanadium.config.prefix.length).split(Vanadium.config.separator);
    var v_name = v_params[0];
    var v_param = v_params[1];
    element_validation.add_validation_modifier(v_name, v_param);
  }
  ;
};

Vanadium.validate = function() {
  var validation = {};
  Vanadium.each(this.elements_validators,
          function() {
            validation[this.element.id] = this.validate();

          });
  return validation;
};

Vanadium.decorate = function(validation_results) {
  if (arguments.length == 0) {
    validation_results = this.validate();
  }
  ;
  Vanadium.each(validation_results,
          function(element_id, element_validation_results) {
            Vanadium.elements_validators[element_id].decorate(element_validation_results);
          });
};

Vanadium.reset = function() {
  Vanadium.each(this.elements_validators,
          function() {
            this.reset();
          });
};






//-------------------- vanadium-dom.js -----------------------------

/*
 =====================================================================
 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 1. Redistributions of source code must retain the above
 copyright notice, this list of conditions and the following
 disclaimer.

 2. Redistributions in binary form must reproduce the above
 copyright notice, this list of conditions and the following
 disclaimer in the documentation and/or other materials provided
 with the distribution.

 3. The name of the author may not be used to endorse or promote
 products derived from this software without specific prior
 written permission.

 THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS
 OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 ARE DISCLAIMED. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY
 DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 @author Daniel Kwiecinski <daniel.kwiecinski@lambder.com>
 @copyright 2009 Daniel Kwiecinski.
 @end
 =====================================================================
 */
Vanadium.extend(
{

  /**
   *	gets the type of element, to check whether it is compatible
   */
  getElementType: function(element) {
    switch (true) {
      case (element.nodeName.toUpperCase() == 'TEXTAREA'):
        return Vanadium.TEXTAREA;
      case (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'TEXT'):
        return Vanadium.TEXT;
      case (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'PASSWORD'):
        return Vanadium.PASSWORD;
      case (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'CHECKBOX'):
        return Vanadium.CHECKBOX;
      case (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'FILE'):
        return Vanadium.FILE;
      case (element.nodeName.toUpperCase() == 'SELECT'):
        return Vanadium.SELECT;
      case (element.nodeName.toUpperCase() == 'INPUT'):
        throw new Error('Vanadium::getElementType - Cannot use Vanadium on an ' + element.type + ' input!');
      default:
        throw new Error('Vanadium::getElementType - Element must be an input, select, or textarea!');
    }
    ;
  },
  is_input_element : function(element) {
    return (element.nodeName.toUpperCase() == 'TEXTAREA') ||
           (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'TEXT') ||
           (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'PASSWORD') ||
           (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'CHECKBOX') ||
           (element.nodeName.toUpperCase() == 'INPUT' && element.type.toUpperCase() == 'FILE') ||
           (element.nodeName.toUpperCase() == 'SELECT')
  },
  /**
   *	makes a span containg the passed or failed advice
   *
   * @return {HTMLSpanObject} - a span element with the advice message in it
   */
  createAdvice: function(element, advice_id, message) {
    var advice = document.createElement('span');
    advice.id = advice_id;
    var textNode = document.createTextNode(message);
    advice.appendChild(textNode);
    element.parentNode.insertBefore(advice, element.nextSibling);
    this.created_advices.push(advice);
  },

  /**
   *	adds the class of the element/advice/container to indicte if valid or not
   */
  addValidationClass: function(element, valid) {
    if (element) {
      this.removeValidationClass(element);
      if (valid) {
        element.className += ' ' + Vanadium.config.valid_class;
      } else {
        element.className += ' ' + Vanadium.config.invalid_class;
      }
      ;
    }
    ;
  },
  /**
   *	removes the class that has been applied to the element/advice/container to indicte if valid or not
   */
  removeValidationClass: function(element) {
    if (element) {
      if (element.className.indexOf(Vanadium.config.invalid_class) != -1) element.className = element.className.split(Vanadium.config.invalid_class).join(' ');
      if (element.className.indexOf(Vanadium.config.valid_class) != -1) element.className = element.className.split(Vanadium.config.valid_class).join(' ');
    }
    ;
  },
  /** element types constants ****/
  TEXTAREA: 1,
  TEXT: 2,
  PASSWORD: 3,
  CHECKBOX: 4,
  SELECT: 5,
  FILE: 6
}
        );


//-------------------- vanadium-element.js -----------------------------


ElementValidation = function(element) {
  this.initialize(element)
};
ElementValidation.prototype = {



  initialize: function(element) {
    this.element = element;
    this.validations = [];
    this.only_on_blur = false;
    this.only_on_submit = false;
    this.wait = 100;
    this.created_advices = [];
    this.decorated = false;
    this.containers = null;
    this.invalid = false;
  },

  add_validation_instance: function(validator_type, param, advice_id) {
    this.validations.push(new Validation(this.element, validator_type, param, advice_id));
  },
  add_validation_modifier: function(modifier, param) {
    if (modifier == 'only_on_blur') {
      //  whether you want it to validate as you type or only on blur  (DEFAULT: false)
      this.only_on_blur = true
    } else if (modifier == 'only_on_submit') {
      //  whether should be validated only when the form it belongs to is submitted (DEFAULT: false)
      this.only_on_submit = true
    } else if (modifier == 'wait') {
      //  the time you want it to pause from the last keystroke before it validates (ms) (DEFAULT: 0)
      var milisesonds = parseInt(param);
      if (milisesonds != NaN && typeof(milisesonds) === "number") {
        this.wait = milisesonds;
      };
    };
  },
  element_containers: function() {
    if (this.containers === null) {
      this.containers = {};
      var parent = this.element.parentNode;
      //search up the DOM tree
      while (parent != document) {
        if (Vanadium.containers[parent.id]) {
          var container = Vanadium.containers[parent.id];
          container.add_element(this);
          this.containers[parent.id] = container;
        };
        parent = parent.parentNode;
      };
    };
    return this.containers;
  },
  // context - the contect in which decoration_callback should be invoked
  // decoration_callback - the decoration used by asynchronous validation
  validate: function(decoration_context, decoration_callback) {
    var result = {};
    Vanadium.each(this.validations, function() {
      result[this.validation_type.className] = this.validate(decoration_context, decoration_callback);
    });
    return result;
  },
  decorate: function(element_validation_results) {
    this.reset();
    this.decorated = true;
    var self = this;
    var passed_and_failed = Vanadium.partition(element_validation_results, function(validation_result) {
      return validation_result.success
    });
    var passed = passed_and_failed[0];
    var failed = passed_and_failed[1];
    // add apropirate CSS class to the validated element
    if (failed.length > 0) {
      this.invalid = true; //mark this validation element as invalid
      Vanadium.addValidationClass(this.element, false);

    } else if (passed.length > 0) {
      Vanadium.addValidationClass(this.element, true);
    };
    // add apropirate CSS class to the validated element's containers
    Vanadium.each(this.element_containers(), function() {
      this.decorate();
    });
    //
    Vanadium.each(failed, function(className, validation_result) {
      var advice = undefined;
      if (validation_result.advice_id) {
        advice = document.getElementById(validation_result.advice_id);
        if (advice) {
          var advice_is_empty = advice.childNodes.length == 0
          if (advice_is_empty || $(advice).hasClass(Vanadium.empty_advice_marker_class)) {
            $(advice).addClass(Vanadium.empty_advice_marker_class);
            $(advice).append("<span>" + validation_result.message + "</span>");
          };
          $(advice).show();
        } else {
          advice = self.create_advice(validation_result);
        };
      } else {
        advice = self.create_advice(validation_result);
      };
      Vanadium.addValidationClass(advice, false);
    });
  },
  validateAndDecorate : function() {
    //That's tricky one ;)
    // 1. we are runing validate to get all validation results
    // 2. there could be possible some validations running asynchronous
    // so we won't get the result imediately. In that case the provided decoration callback
    // will be invoked on return from asynchronous callback
    // It is used by Ajax based server-side validation
    this.decorate(this.validate(this, this.decorate));
  },
  create_advice: function(validation_result) {
    var span = document.createElement("span");
    this.created_advices.push(span);
    $(span).html(validation_result.message);
    $(this.element).after(span);
    return span;
  },
  reset: function() {
    this.invalid = false;
    Vanadium.each(this.validations, function() {
      var advice = document.getElementById(this.adviceId);
      if (advice) {
        if ($(advice).hasClass(Vanadium.empty_advice_marker_class)) {
          $(advice).empty();
        };
        $(advice).hide();
      };
    });

    var created_advice = this.created_advices.pop();
    while (!(created_advice === undefined)) {
      $(created_advice).remove();
      created_advice = this.created_advices.pop();
    };
    Vanadium.removeValidationClass(this.element);
  },
  //
  //
  //
  /**
   * makes the validation wait the alotted time from the last keystroke
   */
  deferValidation: function() {
    if (this.wait >= 300) this.reset();
    var self = this;
    if (self.timeout) clearTimeout(self.timeout);
    self.timeout = setTimeout(function() {
      self.validateAndDecorate();
    }, self.wait);
  },
  setup: function() {
    var self = this;
    this.elementType = Vanadium.getElementType(this.element);

    this.form = this.element.form;

    var proxy = function(oryg_name, delegate) {
      var oryg = self.element[oryg_name];
      self.element[oryg_name] = function() {
        delegate.apply(self, arguments);
        if (oryg) {
          return oryg.apply(self.element, arguments);
        };
      };
    };

    //TODO forms !!!

    //proxy('onfocus', function() {
      //TODO make doONFocus self.doOnFocus(e);
    //});
    if (!this.only_on_submit) {
      switch (this.elementType) {
        case Vanadium.CHECKBOX:
          proxy('onclick', function() {
            this.validateAndDecorate();
          });
          break;
        //TODO check if checkboxes support on-change too. and if yes handle it!
        // let it run into the next to add a change event too
        case Vanadium.SELECT:
        case Vanadium.FILE:
          proxy('onchange', function() {
            this.validateAndDecorate();
          });
          break;
        default:
          proxy('onkeydown', function(e) {
            if (e.keyCode != 9) {
              this.reset();
            };
          });

          if (!this.only_on_blur) {
            proxy('onkeyup', function(e) {
              if (e.keyCode != 9) {
                this.deferValidation();
              };
            });
          };

          proxy('onblur', function() {
            this.validateAndDecorate();
          });
      };
    };
  }
};

//-------------------- vanadium-instance.js -----------------------------


Validation = function(element, validation_type, param, advice_id) {
  this.initialize(element, validation_type, param, advice_id);
};

Validation.prototype = {
  initialize: function(element, validation_type, param, advice_id) {
    this.element = element;
    this.validation_type = validation_type;
    this.param = param;
    //
    this.adviceId = advice_id
  },
  emmit_message: function(message) {
    if (typeof(message) === "string") {
      return message;
    } else if (typeof(message) === "function") {
      return message.call(this, this.element.value, this.param);
    };
  },
  validMessage: function() {
    return this.emmit_message(this.validation_type.validMessage()) || 'ok'
  },
  invalidMessage: function() {
    return this.emmit_message(this.validation_type.invalidMessage()) || 'error'
  },
  test: function(decoration_context, decoration_callback) {
    return this.validation_type.validationFunction.call(this, this.element.value, this.param, this, decoration_context, decoration_callback);
  },
  // decoration_context - the contect in which decoration_callback should be invoked
  // decoration_callback - the decoration used by asynchronous validation
  validate: function(decoration_context, decoration_callback) {
    var return_value = {
      success: false,
      message: "Received invalid return value."
    };
    var validation_result = this.test(decoration_context, decoration_callback);
    if (typeof validation_result === "boolean") {
      return {
        success: validation_result,
        advice_id: this.adviceId,
        message: (validation_result ? this.validMessage() : this.invalidMessage())
      };
    } else if (typeof validation_result === "object") {
      $.extend.apply(return_value, validation_result);
    };
    return return_value;
  }
};

//-------------------- vanadium-types.js -----------------------------


Vanadium.Type = function(className, validationFunction, error_message, message) {
  this.initialize(className, validationFunction, error_message, message);
};
Vanadium.Type.prototype = {
  initialize: function(className, validationFunction, error_message, message) {
    this.className = className;
    this.message = message;
    this.error_message = error_message;
    this.validationFunction = validationFunction;
  },
  test: function(value) {
    return this.validationFunction.call(this, value);
  },
  validMessage: function() {
    return this.message;
  },
  invalidMessage: function() {
    return this.error_message;
  },
  toString: function(){
    return "className:"+this.className+" message:"+this.message+" error_message:"+this.error_message
  }
};

Vanadium.setupValidatorTypes = function() {

  Vanadium.addValidatorType('is_empty', function(v) {
    return  ((v == null) || (v.length == 0));
  });

  Vanadium.addValidatorTypes([
    ['required', function(v) {
      return !Vanadium.validators_types['is_empty'].test(v);
    }, 'This is a required field.'],
    //
    ['number', function(v) {
      return Vanadium.validators_types['is_empty'].test(v) || (!isNaN(v) && !/^\s+$/.test(v));
    }, 'Please enter a valid number in this field.'],
    //
    ['digits', function(v) {
      return Vanadium.validators_types['is_empty'].test(v) || !/[^\d]/.test(v);
    }, 'Please use numbers only in this field. please avoid spaces or other characters such as dots or commas.'],
    //
    ['alpha', function (v) {
      return Vanadium.validators_types['is_empty'].test(v) || /^[a-zA-Z\u00C0-\u00FF\u0100-\u017E\u0391-\u03D6]+$/.test(v)   //% C0 - FF (Ë - Ø); 100 - 17E (? - ?); 391 - 3D6 (? - ?)
    }, 'Please use letters only in this field.'],
    //
    ['asciialpha', function (v) {
      return Vanadium.validators_types['is_empty'].test(v) || /^[a-zA-Z]+$/.test(v)   //% C0 - FF (Ë - Ø); 100 - 17E (? - ?); 391 - 3D6 (? - ?)
    }, 'Please use ASCII letters only (a-z) in this field.'],
    ['alphanum', function(v) {
      return Vanadium.validators_types['is_empty'].test(v) || !/\W/.test(v)
    }, 'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.'],
    //
    ['date', function(v) {
      var test = new Date(v);
      return Vanadium.validators_types['is_empty'].test(v) || !isNaN(test);
    }, 'Please enter a valid date.'],
    //
    ['email', function (v) {
      return (Vanadium.validators_types['is_empty'].test(v)
              ||
              /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(v))
    }, 'Please enter a valid email address. For example fred@domain.com .'],
    //
    ['url', function (v) {
      return Vanadium.validators_types['is_empty'].test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(v)
    }, 'Please enter a valid URL.'],
    //
    ['date_au', function(v) {
      if (Vanadium.validators_types['is_empty'].test(v)) return true;
      var regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      if (!regex.test(v)) return false;
      var d = new Date(v.replace(regex, '$2/$1/$3'));
      return ( parseInt(RegExp.$2, 10) == (1 + d.getMonth()) ) && (parseInt(RegExp.$1, 10) == d.getDate()) && (parseInt(RegExp.$3, 10) == d.getFullYear() );
    }, 'Please use this date format: dd/mm/yyyy. For example 17/03/2006 for the 17th of March, 2006.'],
    //
    ['currency_dollar', function(v) {
      // [$]1[##][,###]+[.##]
      // [$]1###+[.##]
      // [$]0.##
      // [$].##
      return Vanadium.validators_types['is_empty'].test(v) || /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v)
    }, 'Please enter a valid $ amount. For example $100.00 .'],
    //
    ['selection', function(v, elm) {
      return elm.options ? elm.selectedIndex > 0 : !Vanadium.validators_types['is_empty'].test(v);
    }, 'Please make a selection'],
    //
    ['one_required',
      function (v, elm) {
        var options = $$('input[name="' + elm.name + '"]');
        return some(options, function(elm) {
          return getNodeAttribute(elm, 'value')
        });
      }, 'Please select one of the above options.'],
    //
    ['min_length',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          return v.length >= parseInt(p)
        };
      },
      function (_v, p) {
        return 'The value should be at least ' + p + ' characters long.'
      }
    ],
    ['max_length',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          return v.length <= parseInt(p)
        };
      },
      function (_v, p) {
        return 'The value should be at most ' + p + ' characters long.'
      }
    ],
    ['same_as',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          var exemplar = document.getElementById(p);
          if (exemplar)
            return v == exemplar.value;
          else
            return false;
        };
      },
      function (_v, p) {
        var exemplar = document.getElementById(p);
        if (exemplar)
          return 'The value should be the same as <span class="' + Vanadium.config.message_value_class + '">' + ($(exemplar).attr('name') || exemplar.id) + '</span> .';
        else
          return 'There is no exemplar item!!!'
      }
    ],
    ['ajax',
      function (v, p, validation_instance, decoration_context, decoration_callback) {
        if (Vanadium.validators_types['is_empty'].test(v)) return true;
        $.getJSON(p, {value: v}, function(data) {
          decoration_callback.call(decoration_context, [data]);
        });
        return true;
      }]
  ])

  if(VanadiumCustomValidationTypes) Vanadium.addValidatorTypes(VanadiumCustomValidationTypes);
};




//-------------------- vanadium-init.js -----------------------------

$(document).ready(function () {
  if (VanadiumConfig && typeof(VanadiumConfig) === "object") {
    Vanadium.each(VanadiumConfig, function(k, v) {
      Vanadium.config[k] = v;
    })
  };
  Vanadium.init();
});
