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
