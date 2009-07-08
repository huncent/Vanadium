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
Validation = function(element, validation_type, param, advice_id) {
  this.initialize(element, validation_type, param, advice_id)
}

Validation.prototype = {
  initialize: function(element, validation_type, param, advice_id) {
    this.element = element;
    this.validation_type = validation_type;
    this.param = param;
    //
    this.adviceId = advice_id;
    var advice = document.getElementById(advice_id);
    if (advice) {
      $(advice).addClass(Vanadium.config.advice_class);
    }
  },
  emmit_message: function(message) {
    if (typeof(message) === "string") {
      return message;
    } else if (typeof(message) === "function") {
      return message.call(this, this.element.value, this.param);
    }
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
    }
    var validation_result = this.test(decoration_context, decoration_callback);
    if (typeof validation_result === "boolean") {
      return {
        success: validation_result,
        advice_id: this.adviceId,
        message: (validation_result ? this.validMessage() : this.invalidMessage())
      }
    } else if (typeof validation_result === "object") {
      $.extend.apply(return_value, validation_result);
    }
    return return_value;
  }
}