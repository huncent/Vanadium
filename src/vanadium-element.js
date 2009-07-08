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
    this.invalid = undefined;
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
      }
      ;
    }
    ;
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
        }
        ;
        parent = parent.parentNode;
      }
      ;
    }
    ;
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
      this.invalid = false; //mark this validation element as valid
      Vanadium.addValidationClass(this.element, true);
    } else {
      this.invalid = undefined; //mark this validation element as undefined
    }
    ;
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
          }
          ;
          $(advice).show();
        } else {
          advice = self.create_advice(validation_result);
        }
        ;
      } else {
        advice = self.create_advice(validation_result);
      }
      ;
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
    $(span).addClass(Vanadium.config.advice_class);
    $(span).html(validation_result.message);
    $(this.element).after(span);
    return span;
  },
  reset: function() {
    this.invalid = undefined; //mark this validation element as undefined
    Vanadium.each(this.element_containers(), function() {
      this.decorate();
    });
    Vanadium.each(this.validations, function() {
      var advice = document.getElementById(this.adviceId);
      if (advice) {
        if ($(advice).hasClass(Vanadium.empty_advice_marker_class)) {
          $(advice).empty();
        }
        ;
        $(advice).hide();
      }
      ;
    });

    var created_advice = this.created_advices.pop();
    while (!(created_advice === undefined)) {
      $(created_advice).remove();
      created_advice = this.created_advices.pop();
    }
    ;
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

    this.element_containers();

    var proxy = function(oryg_name, delegate) {
      var oryg = self.element[oryg_name];
      self.element[oryg_name] = function() {
        delegate.apply(self, arguments);
        if (oryg) {
          return oryg.apply(self.element, arguments);
        }
        ;
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
            }
            ;
          });

          if (!this.only_on_blur) {
            proxy('onkeyup', function(e) {
              if (e.keyCode != 9) {
                this.deferValidation();
              }
              ;
            });
          };

          proxy('onblur', function() {
            this.validateAndDecorate();
          });
      }
      ;
    }
    ;
  }
};