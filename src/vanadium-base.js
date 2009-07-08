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
  return $.extend.apply($, args);
}

Vanadium.bind = function(fun, context) {
  return function() {
    return fun.apply(context, arguments);
  }
}

//default config
Vanadium.config = {
  valid_class: '-v-valid',
  invalid_class: '-v-invalid',
  message_value_class: '-v-message-value',
  advice_class: '-v-advice',
  prefix: ':',
  separator: ';'
}

Vanadium.empty_advice_marker_class = '-vanadium-empty-advice-'

Vanadium.init = function() {
  this.setupValidatorTypes();
  this.scan_dom();
}

Vanadium.addValidatorType = function(className, validationFunction, message, error_message) {
  this.validators_types[className] = new Vanadium.Type(className, validationFunction, message, error_message);
};

Vanadium.addValidatorTypes = function(validators_args) {
  var self = this;
  Vanadium.each(validators_args,
          function() {
            Vanadium.addValidatorType.apply(self, this);
          }
          )
};


Vanadium.scan_dom = function() {
  Vanadium.each(Vanadium.all_elements(),
          function(_idx, child) {

            var class_names = child.className.split(' ');
            if (Vanadium.is_input_element(child)) {
              var element_validation = new ElementValidation(child);

              Vanadium.elements_validators[child.id] = element_validation

              Vanadium.each(class_names,
                      function() {
                        Vanadium.add_validation_instance(element_validation, this/*class_name*/);
                        Vanadium.add_validation_modifier(element_validation, this/*class_name*/);
                      });
              element_validation.setup();
            } else {
              Vanadium.add_validation_container(child);
            }
          })
}

Vanadium.add_validation_container = function(element) {
  var class_names = element.className.split(' ');
  Vanadium.each(class_names,
          function() {
            if (this.indexOf(Vanadium.config.prefix + 'container') == 0) {
              Vanadium.containers[element.id] = new ContainerValidation(element);
              return true
            }
          });
}

Vanadium.add_validation_instance = function(element_validation, class_name) {
  if (class_name.indexOf(Vanadium.config.prefix) == 0) {
    var v_params = class_name.substr(Vanadium.config.prefix.length).split(Vanadium.config.separator)
    var v_name = v_params[0]
    var v_param = (v_params[1] === "" ? undefined : v_params[1])
    var v_advice_id = v_params[2]
    var validator_type = Vanadium.validators_types[v_name]
    if (validator_type) {
      element_validation.add_validation_instance(validator_type, v_param, v_advice_id);
    }
  }
}

Vanadium.add_validation_modifier = function(element_validation, class_name) {
  if (class_name == Vanadium.config.prefix + 'only_on_blur' || class_name == Vanadium.config.prefix + 'only_on_submit' || class_name.indexOf(Vanadium.config.prefix + 'wait') == 0) {
    var v_params = class_name.substr(Vanadium.config.prefix.length).split(Vanadium.config.separator)
    var v_name = v_params[0]
    var v_param = v_params[1]
    element_validation.add_validation_modifier(v_name, v_param);
  }
}

Vanadium.validate = function() {
  var validation = {};
  Vanadium.each(this.elements_validators,
          function() {
            validation[this.element.id] = this.validate();

          });
  return validation;
}

Vanadium.decorate = function(validation_results) {
  if (arguments.length == 0) {
    validation_results = this.validate();
  }
  Vanadium.each(validation_results,
          function(element_id, element_validation_results) {
            Vanadium.elements_validators[element_id].decorate(element_validation_results);
          });
}

Vanadium.reset = function() {
  Vanadium.each(this.elements_validators,
          function() {
            this.reset();
          });
}




