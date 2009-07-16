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
  toString: function() {
    return "className:" + this.className + " message:" + this.message + " error_message:" + this.error_message
  }
};

Vanadium.setupValidatorTypes = function() {

  Vanadium.addValidatorType('empty', function(v) {
    return  ((v == null) || (v.length == 0));
  });

  Vanadium.addValidatorTypes([
    ['equal', function(v, p) {
      return v == p;
    }, function (_v, p) {
      return 'The value should be equal to <span class="' + Vanadium.config.message_value_class + '">' + p + '</span>.'
    }],
    //
    ['equal_ignore_case', function(v, p) {
      return v.toLowerCase() == p.toLowerCase();
    }, function (_v, p) {
      return 'The value should be equal to <span class="' + Vanadium.config.message_value_class + '">' + p + '</span>.'
    }],
    //
    ['required', function(v) {
      return !Vanadium.validators_types['empty'].test(v);
    }, 'This is a required field.'],
    //
    ['accept', function(v, _p, e) {
      return e.element.checked;
    }, 'Must be accepted!'],
    //
    ['integer', function(v) {
      if (Vanadium.validators_types['empty'].test(v)) return true;
      var f = parseFloat(v);
      return (!isNaN(f) && f.toString == v && Math.round(f) == f);
    }, 'Please enter a valid integer in this field.'],
    //
    ['number', function(v) {
      return Vanadium.validators_types['empty'].test(v) || (!isNaN(v) && !/^\s+$/.test(v));
    }, 'Please enter a valid number in this field.'],
    //
    ['float', function(v) {
      return Vanadium.validators_types['empty'].test(v) || (!isNaN(v) && !/^\s+$/.test(v));
    }, 'Please enter a valid number in this field.'],
    //
    ['digits', function(v) {
      return Vanadium.validators_types['empty'].test(v) || !/[^\d]/.test(v);
    }, 'Please use numbers only in this field. please avoid spaces or other characters such as dots or commas.'],
    //
    ['alpha', function (v) {
      return Vanadium.validators_types['empty'].test(v) || /^[a-zA-Z\u00C0-\u00FF\u0100-\u017E\u0391-\u03D6]+$/.test(v)   //% C0 - FF (Ë - Ø); 100 - 17E (? - ?); 391 - 3D6 (? - ?)
    }, 'Please use letters only in this field.'],
    //
    ['asciialpha', function (v) {
      return Vanadium.validators_types['empty'].test(v) || /^[a-zA-Z]+$/.test(v)   //% C0 - FF (Ë - Ø); 100 - 17E (? - ?); 391 - 3D6 (? - ?)
    }, 'Please use ASCII letters only (a-z) in this field.'],
    ['alphanum', function(v) {
      return Vanadium.validators_types['empty'].test(v) || !/\W/.test(v)
    }, 'Please use only letters (a-z) or numbers (0-9) only in this field. No spaces or other characters are allowed.'],
    //
    ['date', function(v) {
      var test = new Date(v);
      return Vanadium.validators_types['empty'].test(v) || !isNaN(test);
    }, 'Please enter a valid date.'],
    //
    ['email', function (v) {
      return (Vanadium.validators_types['empty'].test(v)
              ||
              /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,})){1,3}$/.test(v))
    }, 'Please enter a valid email address. For example fred@domain.com .'],
    //
    ['url', function (v) {
      return Vanadium.validators_types['empty'].test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(v)
    }, 'Please enter a valid URL.'],
    //
    ['date_au', function(v) {
      if (Vanadium.validators_types['empty'].test(v)) return true;
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
      return Vanadium.validators_types['empty'].test(v) || /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v)
    }, 'Please enter a valid $ amount. For example $100.00 .'],
    //
    ['selection', function(v, elm) {
      return elm.options ? elm.selectedIndex > 0 : !Vanadium.validators_types['empty'].test(v);
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
    ['length',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          return v.length == parseInt(p)
        }
        ;
      },
      function (_v, p) {
        return 'The value should be <span class="' + Vanadium.config.message_value_class + '">' + p + '</span> characters long.'
      }
    ],
    //
    ['min_length',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          return v.length >= parseInt(p)
        }
        ;
      },
      function (_v, p) {
        return 'The value should be at least <span class="' + Vanadium.config.message_value_class + '">' + p + '</span> characters long.'
      }
    ],
    ['max_length',
      function (v, p) {
        if (p === undefined) {
          return true
        } else {
          return v.length <= parseInt(p)
        }
        ;
      },
      function (_v, p) {
        return 'The value should be at most <span class="' + Vanadium.config.message_value_class + '">' + p + '</span> characters long.'
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
        }
        ;
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
        if (Vanadium.validators_types['empty'].test(v)) return true;
        if (decoration_context && decoration_callback) {
          $.getJSON(p, {value: v, id: validation_instance.element.id}, function(data) {
            decoration_callback.apply(decoration_context, [[data], true]);
          });
        }
        return true;
      }]
    ,
    ['format',
      function(v, p) {
        var params = p.split('/');
        if (params.length == 3 && params[0] == "") {
          var pattern = params[1];
          var attributes = params[2];
          try
          {
            var exp = new RegExp(pattern, attributes);
            return exp.test(v);
          }
          catch(err)
          {
            return false
          }
        } else {
          return false
        }
      },
      function (_v, p) {
        var params = p.split('/');
        if (params.length == 3 && params[0] == "") {
          return 'The value should match be <span class="' + Vanadium.config.message_value_class + '">' + p.toString() + '</span> pattern.';
        } else {
          return 'provided parameter <span class="' + Vanadium.config.message_value_class + '">' + p.toString() + '</span> is not valid Regexp pattern.';
        }
      }
    ]
  ])

  if (typeof(VanadiumCustomValidationTypes) !== "undefined" && VanadiumCustomValidationTypes) Vanadium.addValidatorTypes(VanadiumCustomValidationTypes);
};


