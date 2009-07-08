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
Vanadium = {};
Vanadium.Version = '0.1';
Vanadium.Type = "standalone";

// this is copied from jquery 1.3.2
Vanadium.each = function(object, callback, args) {
  var name, i = 0, length = object.length;

  if (args) {
    if (length === undefined) {
      for (name in object)
        if (callback.apply(object[ name ], args) === false)
          break;
    } else
      for (; i < length;)
        if (callback.apply(object[ i++ ], args) === false)
          break;

    // A special, fast, case for the most common use of each
  } else {
    if (length === undefined) {
      for (name in object)
        if (callback.call(object[ name ], name, object[ name ]) === false)
          break;
    } else
      for (var value = object[0];
           i < length && callback.call(value, i, value) !== false; value = object[++i]) {
      }
    ;
  }
  ;
  return object;
};

Vanadium.all_elements = function() {
  return document.getElementsByTagName("*");
};

// this is copied from jquery 1.3.2
Vanadium.text = function(element, text) {
  if (typeof text !== "object" && text != null) {
    Vanadium.empty(element);
    var text_node = (this[0] && this[0].ownerDocument || document).createTextNode(text);
    Vanadium.append(element, text_node);
  }
  ;

  var ret = "";

  Vanadium.each(text || this, function() {
    Vanadium.each(this.childNodes, function() {
      if (this.nodeType != 8)
        ret += this.nodeType != 1 ?
               this.nodeValue :
               Vanadium.text([ this ]);
    });
  });

  return ret;
};

Vanadium.empty = function(element) {
  // Remove element nodes and prevent memory leaks
  Vanadium.each(Vanadium.children(element), function() {
    Vanadium.remove(this);
  });

  // Remove any remaining nodes
  while (this.firstChild)
    this.removeChild(this.firstChild);
};

Vanadium.remove = function(selector) {
  if (!selector || jQuery.filter(selector, [ this ]).length) {
    // Prevent memory leaks
    jQuery("*", this).add([this]).each(function() {
      jQuery.event.remove(this);
      jQuery.removeData(this);
    });
    if (this.parentNode)
      this.parentNode.removeChild(this);
  }
};
