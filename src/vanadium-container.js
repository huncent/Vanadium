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
Vanadium.containers = new HashMap();

var ContainerValidation = function(html_element) {
  this.initialize(html_element)
}

ContainerValidation.prototype = {
  initialize: function(html_element) {
    this.html_element = html_element;
    this.elements = [];
  },
  add_element: function(element) {
    this.elements.push(element);
  },
  decorate: function() {
    var valid = null;
    for (var id in this.elements) {
      if (this.elements[id].invalid === undefined) {
        valid = undefined;
      } else if (this.elements[id].invalid === true) {
        valid = false;
        break;
      } else if (this.elements[id].invalid === false && valid === null) {
        valid = true;
      }
    }
    if (valid === undefined) {
      $(this.html_element).removeClass(Vanadium.config.invalid_class);
      $(this.html_element).removeClass(Vanadium.config.valid_class);
    } else if (valid) {
      $(this.html_element).removeClass(Vanadium.config.invalid_class);
      $(this.html_element).addClass(Vanadium.config.valid_class);
    } else {
      $(this.html_element).removeClass(Vanadium.config.valid_class);
      $(this.html_element).addClass(Vanadium.config.invalid_class);
    }
  }
}