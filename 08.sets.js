/*
The files in this directory are part of $dlb_id_au$.schema, a javascript-based library.
Copyright (C) 2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


$dlb_id_au$.schema.sets = function() {

  var module = {};
  var gen_utils = $dlb_id_au$.utils.gen_utils;
  var pretty    = $dlb_id_au$.utils.pretty_print.p;
  var schema3   = $dlb_id_au$.schema.schema3;

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
            schema:schema3.gen(defn),
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

