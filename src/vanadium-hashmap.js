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
var HashMap = function() {
  this.initialize();
}

HashMap.prototype = {
  hashkey_prefix: "<#HashMapHashkeyPerfix>",
  hashcode_field: "<#HashMapHashcodeField>",

  initialize: function() {
    this.backing_hash = {};
    this.code = 0;
  },
  /*
   maps value to key returning previous assocciation
   */
  put: function(key, value) {
    var prev;
    if (key && value) {
      var hashCode = key[this.hashcode_field];
      if (hashCode) {
        prev = this.backing_hash[hashCode];
      } else {
        this.code += 1;
        hashCode = this.hashkey_prefix + this.code;
        key[this.hashcode_field] = hashCode;
      }
      this.backing_hash[hashCode] = value;
    }
    return prev;
  },
  /*
   returns value associated with given key
   */
  get: function(key) {
    var value;
    if (key) {
      var hashCode = key[this.hashcode_field];
      if (hashCode) {
        value = this.backing_hash[hashCode];
      }
    }
    return value;
  },
  /*
   deletes association by given key.
   Returns true if the assocciation existed, false otherwise
   */
  del: function(key) {
    var success = false;
    if (key) {
      var hashCode = key[this.hashcode_field];
      if (hashCode) {
        var prev = this.backing_hash[hashCode];
        this.backing_hash[hashCode] = undefined;
        if(prev !== undefined)
          success = true;
      }
    }
    return success;
  }
}

//// Usage

// creation

var my_map = new HashMap();

// insertion

var a_key = {};
var a_value = {struct: "structA"};
var b_key = {};
var b_value = {struct: "structB"};
var c_key = {};
var c_value = {struct: "structC"};

my_map.put(a_key, a_value);
my_map.put(b_key, b_value);
var prev_b = my_map.put(b_key, c_value);

// retrieval

if(my_map.get(a_key) !== a_value){
  throw("fail1")
}
if(my_map.get(b_key) !== c_value){
  throw("fail2")
}
if(prev_b !== b_value){
  throw("fail3")
}

// deletion

var a_existed = my_map.del(a_key);
var c_existed = my_map.del(c_key);
var a2_existed = my_map.del(a_key);

if(a_existed !== true){
  throw("fail4")
}
if(c_existed !== false){
  throw("fail5")
}
if(a2_existed !== false){
  throw("fail6")
}

