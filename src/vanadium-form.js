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
var VanadiumForm = function(element) {
  this.initialize(element);
}

Vanadium.forms = new HashMap();

VanadiumForm.add_element = function(validation_element) {
  var form = validation_element.element.form;
  if (form) {
    var vanadum_form = Vanadium.forms.get(form);
    if (vanadum_form) {
      vanadum_form.validation_elements.push(validation_element);
    } else {
      vanadum_form = new VanadiumForm(validation_element);
      Vanadium.forms.put(form, vanadum_form);
    }
  }
}


VanadiumForm.prototype = {

  initialize: function(validation_element) {
    this.validation_elements = [validation_element];
    this.form = validation_element.element.form;
    var self = this;
    $(this.form).bind('onsubmit', function() {
      var validation_result = self.validate();

      var success = true;
      validation_result.each(function(_element, validation_results) {
        for (var r in validation_results) {
          if (validation_results[r].success == false) {
            success = false;
            break;
          }
        }
        if (success == false) {
          return false;// break from hashmap iteration
        }
      });
      if (!success) {
        self.decorate();
        return false;
      }
    });
    this.form.decorate = function(){
      self.decorate();
    }
  },

  validate: function() {
    var validation = new HashMap();
    Vanadium.each(this.validation_elements,
            function() {
              validation.put(this, this.validate());
            });
    return validation;
  },

  decorate: function(validation_results) {
    if (arguments.length == 0) {
      validation_results = this.validate();
    }
    validation_results.each(function(element, element_validation_results) {
      element.decorate(element_validation_results);
    });
  }
}
