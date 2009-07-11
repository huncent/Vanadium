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


Vanadium.validators_types = {};
Vanadium.elements_validators_by_id = {};
Vanadium.created_advices = [];


//default config
Vanadium.config = {
  valid_class: 'vanadium-valid',
  invalid_class: 'vanadium-invalid',
  message_value_class: 'vanadium-message-value',
  advice_class: 'vanadium-advice',
  prefix: ':',
  separator: ';',
  reset_defer_timeout: 100
}

Vanadium.empty_advice_marker_class = '-vanadium-empty-advice-'

//validation rules
Vanadium.rules = {}


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

              if (child.id)
                Vanadium.elements_validators_by_id[child.id] = element_validation

              VanadiumForm.add_element(element_validation);

              //create validation rules based on class markup
              Vanadium.each(class_names,
                      function() {
                        var parameters = Vanadium.parse_class_name(this);
                        /*'this' is class_name*/
                        if (parameters) {
                          Vanadium.add_validation_instance(element_validation, parameters);
                          Vanadium.add_validation_modifier(element_validation, parameters);
                        }
                      });
              //create validation rules based on json providen in VanadiumRules variable
              //create validation rules based on class markup
              Vanadium.each(Vanadium.get_rules(child.id),
                      function() {
                        var parameters = this;
                        if (parameters) {
                          Vanadium.add_validation_instance(element_validation, parameters);
                          Vanadium.add_validation_modifier(element_validation, parameters);
                        }
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
            var parameters = Vanadium.parse_class_name(this);
            if (parameters[0] == 'container') {
              Vanadium.containers.put(element, new ContainerValidation(element));
              return true
            }
          });
  Vanadium.each(Vanadium.get_rules(element.id),
          function() {
            var rule = this;
            if (rule == 'container') {
              Vanadium.containers.put(element, new ContainerValidation(element));
              return true
            }
          });
}

Vanadium.get_rules = function(element_id) {
  var rule_from_string_or_hash = function(r) {
    if (typeof r === "string") {
      return [r];
    } else if (Vanadium.isArray(r)) {
      return r;
    } else if (typeof(r) === "object") {
      return [r.validator, r.parameter, r.advice];
    } else {
      return undefined;
    }
  }
  //
  var rules = [];
  //
  var rs = Vanadium.rules[element_id];
  if (typeof rs === "undefined") {
    return [];
  } else if (typeof rs === "string") {
    rules.push(rs);
  } else if (Vanadium.isArray(rs)) {
    for (var r in rs) {
      rules.push(rule_from_string_or_hash(rs[r]));
    }
  } else if (typeof(rs) === "object") {
    rules.push(rule_from_string_or_hash(rs));
  }
  return rules;
}

Vanadium.parse_class_name = function(class_name) {
  if (class_name.indexOf(Vanadium.config.prefix) == 0) {
    var v_params = class_name.substr(Vanadium.config.prefix.length).split(Vanadium.config.separator)
    for (var key in v_params) {
      if (v_params[key] == "") {
        v_params[key] = undefined
      }
    }
    return v_params;
  } else {
    return [];
  }
}

Vanadium.add_validation_instance = function(element_validation, parameters) {
  var v_name = parameters[0];
  var v_param = parameters[1];
  var v_advice_id = parameters[2];
  var validator_type = Vanadium.validators_types[v_name]
  if (validator_type) {
    element_validation.add_validation_instance(validator_type, v_param, v_advice_id);
  }
}

Vanadium.add_validation_modifier = function(element_validation, parameters) {
  var m_name = parameters[0];
  var m_param = parameters[1];
  if (m_name == 'only_on_blur' || m_name == 'only_on_submit' || m_name == 'wait' || m_name == 'advice') {
    element_validation.add_validation_modifier(m_name, m_param);
  }
}

Vanadium.validate = function() {
  var validation = new HashMap();
  Vanadium.each(this.elements_validators,
          function() {
            validation.put(this.element, this.validate());
          });
  return validation;
}

Vanadium.decorate = function(validation_results) {
  if (typeof validation_results === "object") {
    if (validation_results.toString() == "HashMapJS") {
      validation_results.each(function(element, element_validation_results) {
        element.decorate(element_validation_results);
      })
    } else {
      var element_id;
      for (element_id in validation_results) {
        var element = Vanadium.elements_validators_by_id[element_id];
        if (element) {
          element.decorate(validation_results[element_id]);
        }
      }
    }
  }
}

Vanadium.reset = function() {
  Vanadium.each(this.elements_validators,
          function() {
            this.reset();
          });
}




