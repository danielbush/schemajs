/*
The files in this directory are part of $dlb_id_au$.schema, a javascript-based library.
Copyright (C) 2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


$dlb_id_au$.schema.schema3 = function() {

  var module = {};
  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var pretty    = $dlb_id_au$.utils.pretty_print.p;

  var isValue = function(thing) {
    if(!thing) return true;
    if(typeof(thing)=='object') return false;
    // What's left: primitives (number, boolean), functions etc
    // These should all be treated like values (ie we don't recurse
    // on them).
    return true;
  }

  // Generates a make function that makes an object according to
  // (schema-like) definition 'defn'.
  //
  // See examples at bottom.
  //
  // How to understand this function:
  // - we call gen on a schema defn (D)
  // - there are 4 types of defns
  //   - array, D = [D|V]
  //   - keyed array (_key_), {_key_:D|V}
  //   - assoc array 
  //     {a:D|V,b:D|V,...} where a,b are specified set of keys
  //   - values (V) (eg null,1,true,functions etc)
  //     This is like a terminal symbol in a grammar.
  // - each definition except for V, may be recursively defined
  //   - so arrays could be arrays of nested defns (ND), similarly
  //     keyed arrays etc
  //   - D|V means "either D or V"
  // - gen will take definition D and create 'make' M and
  //   'withInstance' W functions for that defn;
  //   but it will also recurse on the nested definition/s in D
  //
  // So, we have a 'make' function M.
  // Associated with M are
  // - 'o', a container which allows us to add methods/data and
  //   which is passed to the function given to 'make'
  // - a definition D that was passed to 'gen' which created 'make'
  // - a 'result' representing an instance of D that 'make' creates
  //   (or receives) and then returns
  // - note that D will have a nested definition ND
  // - 'o' may have method/s that generate an instance of ND and
  //   update 'result' with this result.
  //
  // HOW TO REALLY THINK ABOUT THIS:
  // I'd recommend understanding how the recursion works for
  // arrays, keyed arrays and values.
  // Arrays and keyed arrays use 'push' and 'addKey' respectively.
  // Then look at how the assoc array definition extends this behaviour.
  // With assoc array, we have specified keys that we can use which we add
  // to 'o', sort of like setters for those keys.
  // The method 'add' is used after the key ie o[key].add .
  // If you see 'add' it is adding a specified key.
  // So we have: o[key].add(...recurse...).
  // If the ND is an array or keyed array we add convenience functions:
  //   o[key].push(...)
  //   o[key].addKey(...)
  // respectively.

  module.gen = function(defn) {
    var o = {};
    var result;
    var newResult;

    // D = array

    if(defn instanceof Array) {
      if(defn.length!=1) {
        throw new Error("Array definitions must contain one item.");
      }
      newResult = function(){return [];}

      // ND = value
      if(isValue(defn[0])) {
        o.set = function(v) {
          module.typeCheck$(defn[0],v,defn);
          result.push(v);
        }
      }

      // ND = non-value
      else {
        o.defn = defn[0];
        o.m = module.gen(o.defn);
        o.push = function(fn) {
          result.push(o.m.make(fn));
        };
        o.map = function(thing,fn){
          gen_utils.each(thing,function(v,k){
            result.push(o.m.make(function(o){fn(o,v,k);}));
          });
        };
      }
    }

    // D = keyed array

    else if(typeof(defn)=='object' && defn && defn.hasOwnProperty('_key_')) {
      newResult = function(){return {};}

      // ND = value
      if(isValue(defn['_key_'])) {
        o.case = 0;
        o.addKey = function(key,v) {
          result[key] = v;
        };
      }

      // ND = non-value
      else {
        o.case = 1;
        o.defn = defn['_key_'];
        o.m = module.gen(o.defn);
        o.addKey = function(key,fn) {
          result[key] = o.m.make(fn,result[key]);
        };
        o.map = function(thing,fn,keyfn){
          gen_utils.each(thing,function(v,k){
            var key = keyfn?keyfn(v,k):k;
            result[key] = o.m.make(function(o){fn(o,v,k);},result[key]);
          });
        };
      }
    }

    // D = assoc array (with specified keys)

    else if(typeof(defn)=='object' && defn) {
      newResult = function(){return {};}
      if(!result) result = {};

      // ND = for each key, the value in that key:
      gen_utils.each(defn,function(v,k){
        o[k] = {
          key:k
        };

        // ND = value
        if(isValue(v)) {
          o[k].set = function(v2) {
            module.typeCheck$(v,v2,defn,
                              'Specificied keys, offending key is:'+this.key);
            result[this.key] = v2;
          }
        }

        // ND = non-value
        else {
          o[k].defn = v;
          o[k].m = module.gen(o[k].defn);
          // If we don't merge, subsequent calls to o[k].add will wipe
          // previous ones.
          o[k].add = function(fn){
            if(!result[this.key]) {
              result[this.key] = o[this.key].m.make(fn);
            }
            else {
              // merge(a,b) => "merge b into a"
              gen_utils.merge(result[this.key],
                              o[this.key].m.make(fn,result[this.key]));
            }
          };

          // Convenience: shortcut for nested definition that is a
          // keyed array.

          if(typeof(v)=='object' && v && v.hasOwnProperty('_key_')) {
            o[k].addKey = function(key,fn){
              o[this.key].add(function(o){
                o.addKey(key,fn);
              });
            };
            o[k].map = function(thing,fn,keyfn){
              o[this.key].add(function(o){
                o.map(thing,fn,keyfn);
              });
            };
          }

          // Convenience: shortcut for nested definition that is an
          // array.

          else if(v instanceof Array) {
            o[k].push = function(fn){
              o[this.key].add(function(o){
                o.push(fn);
              });
            };
            o[k].map = function(thing,fn){
              o[this.key].add(function(o){
                o.map(thing,fn);
              });
            };
          }

        }
      });
    }

    // D = V

    else {
      newResult = function(){return null;}
      o.set = function(v) {
        module.typeCheck$(defn,v,defn);
        result = v;
      }
    }

    // Return a schema object for this definition which has make and
    // withInstance methods.

    return {

      // Make can work with an existing result if you pass it in.
      // 
      // Otherwise, it will generate a new structure.

      make:function(fn,result2) {
        if(!result2) {
          result = newResult();
        } else {
          result = result2;
        }
        fn(o);
        return result;
      },
      withInstance:function(i,fn) {
        result = i;
        fn(o);
        return result;
      }
    };

  };

  // Test type of V in defintion D, for use with gen/make above.
  //
  // IMPORTANT: only test for functions at the moment otherwise we
  // allow.  Also, only test for functions if an actual_value was
  // given (ie not null or undefined).
  //
  // When we do o['property1'].set (etc) within a call to 'make' check
  // the type if a specific one was used in the definition.
  // Most obvious one is if a definition specifies a function as a
  // value.

  module.typeCheck = function(defn_value,actual_value) {
    var dtype = typeof(defn_value);
    var atype = typeof(actual_value);
    if(
        // An actual value was defined:
        actual_value &&
        // Defn is a function:
        (dtype=='function') &&
        // The actual type of actual value isn't a function;
        (dtype!=atype) )
    {
      return false;
    }
    return true;
  };

  module.typeCheck$ = function(defn_value,actual_value,defn,additional_msg) {
    var result = module.typeCheck.apply(null,arguments);
    if(!result) {
      throw new Error(
        "Typecheck: value supplied doesn't match type used in definition.  "
          +"Type should be:"+typeof(defn_value)+". "
          +"You used value:<"+actual_value+">. "
          +"In defn: "+pretty(defn)+". "
          +(additional_msg ? additional_msg : "")
      );
    }
  };

  // A set is a set of related definitions -- maybe ones used by a
  // particular thing.
  //
  // Instances created from a set will have 2 additional properties:
  // _set_ (the set name) and _type_ (the type name of the
  // definition).
  //
  // Also see receiversFor, which requires _set_ and _type_ to be set.

  module.makeSet = function(name) {
    var set = {
      name:name,
      types:{},
      methods:{
        // Add a signal to this set with _type_ attribute set.
        add:function(type,defn) {
          set.types[type] = {
            defn:defn,
            type:type,
            schema:module.gen(defn),
            make:function(fn){
              var s = this.schema.make(fn);
              s._type_ = this.type;
              s._set_ = set.name;
              return s;
            },
            withInstance:function(i,fn){
              return this.schema.withInstance(i,fn);
            }
          };
        }
      }
    };
    return set;
  };

  module.withNewSet = function(name,fn) {
    var set = module.makeSet(name);
    fn(set.methods);
    return set;
  };

  // Allows you to define a set of receive functions for each type of
  // schema in a set.
  //
  // IMPORTANT: you must create data using the set which will set
  // _type_ and _set_ attributes on the data.  receiversFor must be
  // able to match these.

  module.receiversFor = function(set,receivers,catchallfn) {
    gen_utils.each(receivers,function(v,k){
      if(!set.types[k]) {
        throw new Error("Receiver type: "+k+" is not in the specified set.");
      }
    });
    return function(o) {
      var receiver;
      if(!o._set_) {
        throw new Error("receiversFor expects data with a _set_ attribute.");
      }
      if(!o._type_) {
        throw new Error("receiversFor expects data with a _type_ attribute.");
      }
      if(set.name != o._set_) {
        throw new Error("Received set "+o._set_+" and not "+set.name+".");
      }
      if(receiver = receivers[o._type_]) {
        return receiver.call(this,o);
      }
      else {
        if(catchallfn) {
          return catchallfn(o);
        }
      }
    };
  };

  return module;

}();

