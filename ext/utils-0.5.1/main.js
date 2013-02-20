/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

var $dlb_id_au$ = $dlb_id_au$ || {};

$dlb_id_au$.utils = {};
/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

/*
  map/each
  ========
  map/each functions are self-explanatory and probably unnecessary
  given the right version of js or the use of a library like
  underscore.js.

  Recursive iteration and mapping
  ===============================

  eachr
  -----
  each will iterate through object and arrays.
  eachr will do likewise, but will recurse on the values found during
  this iteration.
  During each call, eachr will pass the current object it is looking
  at to the function supplied to it, then recursing on that object's
  elements, then call the same function again afterwards.
  A flag is passed to the function to tell it which phase.

  mapr
  ----
  Similar to eachr but if you alter the object passed
  to the function, it will alter a clone.  mapr will
  always recurse on the original.  If you add fields to
  an object or elements to an array, these will be on
  the clone.

*/


$dlb_id_au$.utils.gen_utils = function() {

  var module = {};

  // Make a new object whose prototype is `o`.
  //
  // Taken from Douglas Crockford:
  // http://javascript.crockford.com/prototypal.html

  module.object = function(o) {
    function F() {}
    F.prototype = o;
    return new F();
  };

  // Transform `thing` using `fn`.
  //
  // If `fn` not provided, `map` will act like
  // a shallow clone, creating a copy of the object
  // but using the same members as the original.

  module.map = function(thing,fn) {
    var m;
    if(thing.length) {
      m = [];
      module.each(thing,function(n,key){
        if(fn) {
          m.push(fn(n,key));
        } else {
          m.push(n);
        }
      });
      return m;
    }
    else if(typeof(thing)=='object') {
      m = {};
      module.each(thing,function(n,key){
        if(fn) {
          m[key] = fn(n,key);
        } else {
          m[key] = n;
        }
      });
      return m;
    }
  };

  // Iterate through array or object.

  module.each = function(thing,fn) {
    // thing.length handles 'arguments' object.
    if(thing.length) {
      for(var i=0;i<thing.length;i++) {
        fn(thing[i],i);
      }
    }
    else if(typeof(thing) == 'object') {
      for(var n in thing) {
        if(thing.hasOwnProperty(n)) {
          fn(thing[n],n);
        }
      }
    }
  };

  // Recurse on nested objects and arrays passing the
  // object or array to `fn` both before and after
  // recursing on its members.
  //
  // Usage:
  //   eachr(thing,null,fn)
  // The other arguments are used when recursing.
  //
  // `fn` is called like this
  //   fn(thing,index.before,p)
  // If `fn` returns true, then stop recursing.
  // 
  // For example, if the object is a DOM element
  // you probably don't want to recurse on it.
  // (You may want to recurse on it using a DOM tree walker
  // instead).
  // Use `each` to iterate through each object inside `fn`.
  //
  // We pass `nested` because this just a handy thing
  // to see when debugging the recursion.
  //
  // If you want to modify the thing you are recursing
  // on, you should probably attempt this only when
  // the before flag is false.
  // If you want to transform the thing you are recursing
  // on but don't want to alter it, consider using
  // mapr.

  module.eachr = function(thing,index,fn,nested,p) {
    var r;
    // The outer call should not set `nested`.
    // We set it to zero.
    if(!nested) nested=0;
    if(thing instanceof Array) {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var i=0;i<thing.length;i++) {
          module.eachr(thing[i],i,fn,nested+1,thing);
        }
      }
      r = fn(thing,index,false,nested,p);
    }
    else if(typeof(thing) == 'object') {
      r = fn(thing,index,true,nested,p);
      if(!r) {
        for(var n in thing) {
          if(thing.hasOwnProperty(n)) {
            module.eachr(thing[n],n,fn,nested+1,thing);
          }
        }
      }
      r = fn(thing,index,false,nested,p);
    } else {
      r = fn(thing,index,true,nested,p);
    }
  };

  (function(){

    // Similar to eachr: recurse on `thing` but generate a copy of
    // `thing` as we recurse.
    //
    // `fn` only sees the copy so you can add properties
    // to it etc and not affect the original which
    // is in the process of being recursed on.
    //
    // The return value of `fn` is not used to transform
    // the mapping, instead following eachr semantics.
    // To transform existing elements in the clone,
    // alter `thing` and assign it to `p[index]`.
    //
    // The intention is that `thing` is a nested combination
    // of object and array literals (or something of that nature).

    module.mapr = function(thing,index,fn,nested,p) {
      var r,o;
      if(!nested) nested=0;

      // eg {prop:null}
      if(!thing) return thing;

      // Pass `o` to `fn` but recurse on `thing`.
      // Also note that we pass `o` as `p` when
      // recursing.

      if(thing instanceof Array) {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var i=0;i<thing.length;i++) {
            module.mapr(thing[i],i,fn,nested+1,o);
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else if(typeof(thing) == 'object') {
        o = clone(thing,p,index);
        r = fn(o,index,true,nested,p);
        if(!r) {
          for(var n in thing) {
            if(thing.hasOwnProperty(n)) {
              module.mapr(thing[n],n,fn,nested+1,o);
            }
          }
        }
        r = fn(o,index,false,nested,p);
      }
      else {
        r = fn(thing,index,true,nested,p);
      }

      return o;
    };

    var clone = function(thing,p,pindex) {

      // Shallow clone:
      var o = module.map(thing);

      // p is the ancestor of o but it
      // was a shallow clone of `thing`, so
      // p's members are the originals.
      // So what we are doing here is replacing
      // them with o.

      if(p) {
        p[pindex] = o;
      }
      return o;
    };

  })();

  // Merge b into a.
  //
  // a,b should be objects.
  // Arrays are not handled as arrays(!).
  // Generally, a and b are probably
  // object literals that you are working
  // with.
  //
  // For convenience `a` is returned.
  // 

  module.merge = function(a,b) {
    module.each(b,function(bval,bname){
      a[bname] = bval;
    });
    return a;
  };

  // Run fn n-times; if fn returns false, then halt.

  module.dotimes = function(n,fn) {
    var result;
    for(var i=0;i<n;i++) {
      result = fn(i);
      if(result===false) return;
    }
  };

  // Join elements in arr where arr is result of
  // String.prototype.split.
  // 
  // `unsplit`: will be run on every empty gap in the array
  //            including before and after
  // `process`: is called only for non-blank gaps
  // `o`      : is an optional object you can pass in which will be
  //            passed on to `unsplit` and `process`

  module.join = function(arr,unsplit,process,o) {
    var i,l=arr.length;
    for(i=0;i<l;i++) {
      if(arr[i]!=='') process(arr[i],o);
      //process(arr[i],o);
      if(i!=l-1) unsplit(o);
    }
    return o;
  };

  return module;

}();

/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/

// Generic linked list.
//
// Supports push/pop operations.

$dlb_id_au$.utils.list2 = function(){

  var module = {};

  module.List = function() {
    this.head = null;
    this.tail = null;
    this.length = 0;
    // Place to hang functions or data associated with this list.
    this.data = {};
  };

  module.makeEntry = function() {
    return {
      next:null,
      previous:null,
      // Place to hang functions or data associated with this list
      // item.
      data:{}
    };
  };

  //------------------------------------------------------------
  // List operations:

  // Get ith element from list.

  module.List.prototype.get = function(i) {
    var n,j;
    for(j=0,n=this.head;n;n=n.next,j++) {
      if(j==i) return n;
    }
  };

  // Insert new entry at the ith position.
  //
  // If i > length, then add as the last item.
  // Use module.push to insert at last position.

  module.List.prototype.insert = function(i,entry) {
    var m,n;

    if(i>=this.length) {
      return this.push();
    }

    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    m = module.get(i);
    if(!m) throw new Error("insert: corrupt list");
    this.root.insertBefore(m);

    // <-- [m.previous] --1-- *[n] --2-- [m] -->

    // 1
    m.previous.next = n;
    n.previous = m.previous;

    // 2
    n.next = m;
    m.previous = n;

    this.length++;
    return n;
  };

  // Append entry to end of list.

  module.List.prototype.push = function(entry) {
    var t,n;
    if(entry) {
      n = entry;
    } else {
      n = module.makeEntry();
    }
    if(this.length>0) {
      t = this.tail;
      this.tail = n;
      t.next = this.tail;
      this.tail.previous = t;
    } else {
      this.length = 0;
      this.head = this.tail = n;
    }
    this.length++;
    return n;
  };

  // Pop last element from list.

  module.List.prototype.pop = function() {
    var p;
    if(this.length>0) {
      p = this.tail.previous;
      this.length--;
      if(p) {
        this.tail = p;
      }
      else {
        this.length = 0;
        this.head = this.tail = null;
      }
      this.tail = p;
    }
  };

  // Remove ith element from list and return it.
  //
  // Return null if we can't get it.

  module.List.prototype.remove = function(i) {
    var next,previous;
    var n  = this.get(i);
    if(n) {
      previous = n.previous;
      next = n.next;
      previous.next = next;
      next.previous = previous;
      return n;
    } else {
      return null;
    }
  };

  module.List.prototype.clear = function() {
    this.length = 0;
    this.head = null;
    this.tail = null;
  };


  module.List.prototype.walk = function(fn) {
    var n,i;
    for(i=0,n=this.head;n;i++,n=n.next) {
      if(fn(n,i)) {
        break;
      }
    }
  };

  module.incr = function(curr,max) {
    curr+=1;
    return curr%=max;
  };

  module.decr = function(curr,max) {
    curr-=1;
    curr%=max;
    if(curr<0) {
      curr*=-1;
    }
    return curr;
  };

  return module;

}();
/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


// Special function stack.
// 
// The stack is assumed to contain items of form:
//   [fn,a,b,c,...]
// and unwinding will pop the item and then call:
//   item[0](item)
//
// This is a way to undo things that were done previously without
// using closures or classes.


$dlb_id_au$.utils.stack = function(){

  var module = {};

  module.Stack = function() {
    this.stack = [];
  };

  // Unwinds a stack.
  //

  module.Stack.prototype.unwind = function() {
    if(this.stack.length>0) {
      while(this.pop()){};
    }
  };

  module.Stack.prototype.pop = function() {
    var item;
    if(this.stack.length>0) {
      item = this.stack.pop();
      item[0](item);
      return item;
    }
    return null;
  };

  module.Stack.prototype.push = function(arr) {
    if(typeof(arr[0])!='function') {
      throw new Error("focus.stack.push: bad first argument.");
    }
    this.stack.push(arr);
  };

  return module;

}();
/*
The files in this directory are part of $dlb_id_au$.utils, a javascript-based library.
Copyright (C) 2012-2013 Daniel Bush
This program is distributed under the terms of the GNU
General Public License.  A copy of the license should be
enclosed with this project in the file LICENSE.  If not
see <http://www.gnu.org/licenses/>.
*/


// Pretty print module for javascript.
//
// Probably a tidier way to write module.pp
// would have been to write a generic recursive
// function that walks through arrays and objects.
// Then pass a function/closure in.

$dlb_id_au$.utils.pretty_print = function() {

  var module = {};

  // Configuration settings for 'p' (the pretty printer).
  //
  // See module.p below.

  module.CONFIG = {

    // Number of levels to recurse before stopping.

    max_levels:10,

    // If on=true, print js structures with linebreaks
    // and indentation in an agreeable way.

    extended:{
      on:false,
      // Newline to use if extended.  
      newline:'\r\n',
      // Indentation character/s to use.
      // If we nest n times, indentation will be n*indent.
      indent:'  '
    },

    // If set to integer, shorten long values.
    //
    // Set to false or null otherwise.

    length:false

  };

  // Events fired by eachr.

  module.EVENTS = {

    // Called at beginning of array.
    arrayStart:0,
    // Called at end of array.
    arrayEnd:1,

    // Called before processing each item in array.
    arrayItemStart:2,
    arrayItemStartFirst:4,
    // Called after processing each item in array.
    arrayItemEnd:3,

    // Similar to array (above).
    objectStart:10,
    objectEnd:11,
    objectItemStart:12,
    objectItemStartFirst:14,
    objectItemEnd:13,

    // Items encountered in array of js object.
    item:20,

    // Called for the first array or object item.
    firstItem:21
  };


  // Recurse through a javascript entity and fire events (callback
  // function called with an event parameter) as we go.
  //
  // By "entity" we mean pretty much anything in js.
  // 
  // Eachr looks for normal js objects and arrays and recurses
  // through these, firing appropriate events.
  // Events that are fired are like:
  // "we're starting an array",
  // "we're ending an array"
  // etc
  //
  // Params:
  // @fn    The callback
  // @level Set on recursion, values are >=1 where
  //        1 is first level of recursion, etc.
  // @max   Max level after which we stop recursing.
  // 
  // Notes
  // We have to set a limit on recursion otherwise
  // we could get in infinite loops involving things
  // that reference eachother.

  module.eachr = function(thing,fn,max,level) {
    if(!level) level = 0; // We should be top level.
    //if(!max) max = module.CONFIG.max_levels;
    if(!max) throw new Error('eachr: max nesting level must be set.');
    if(level > max) {
      return;
    }
    switch(typeof(thing)) {
    case 'object':
      if(thing instanceof Array) {
        fn(module.EVENTS.arrayStart,null,thing,level);
        for(var i=0;i<thing.length;i++) {
          if(i==0) {
            fn(module.EVENTS.arrayItemStartFirst,
               i,thing[i],level);
          }
          fn(module.EVENTS.arrayItemStart,
             i,thing[i],level);
          module.eachr(thing[i],fn,max,level+1);
          fn(module.EVENTS.arrayItemEnd,i,thing[i],level);
        }
        fn(module.EVENTS.arrayEnd,null,thing,level);
      }
      // There are "objects" that aren't instanceof Object
      // such as strings, functions, rhino java objects etc.
      //
      // Skip DOM elements.
      // TODO: Is there a better way to decide what to recurse on?

      else if(thing instanceof Object && !thing.nodeType) {
        var first=true,n,empty=true;
        // Check if object is empty.
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            empty = false;
            break;
          }
        }
        if(empty) {
          fn(module.EVENTS.objectStart,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectStart,null,thing,level);
        }
        for(n in thing) {
          if(thing.hasOwnProperty(n)) {
            if(first) {
              fn(module.EVENTS.objectItemStartFirst,
                 n,thing[n],level);
              first = false;
            }
            fn(module.EVENTS.objectItemStart,
               n,thing[n],level);
            module.eachr(thing[n],fn,max,level+1);
            fn(module.EVENTS.objectItemEnd,n,thing[n],level);
          }
        }
        if(empty) {
          fn(module.EVENTS.objectEnd,null,thing,level,{empty:true});
        } else {
          fn(module.EVENTS.objectEnd,null,thing,level);
        }
      }
      else {
        // Rhino java objects might end up here?
        fn(module.EVENTS.item,null,thing,level);
      }
      break;
    default:
      fn(module.EVENTS.item,null,thing,level);
      break;
    };
  };

  (function() {

    var to_string = function(thing) {
      if(thing.toString) {
        return thing.toString();
      } else {
        return thing+'';
      }
    };

    var print_string = function(thing) {
      return '"'+thing+'"';
    };

    // Generate a string representing a js thing.
    //
    // No attempt is made to remove or even add newlines
    // or add or squeeze spacing.
    //
    // NOTE: don't camelcase! toString is an inbuilt
    // method!!!

    module.to_string = function(thing) {
      var s;

      if(thing == undefined) {
        return 'undefined';
      }
      if(thing == null) {
        return 'null';
      }
      if(thing === false) {
        return 'false';
      }
      if(thing === true) {
        return 'true';
      }

      switch(typeof(thing)) {
      case 'object':
        if(thing instanceof Array) {
          return thing.toString();
        }
        else if(thing instanceof Object) {
          return thing.toString();
        }
        else if(thing instanceof String) {
          return print_string(thing);
        }
        // Rhino
        else if(java && java.lang) {
          if(thing['class']===java.lang.Class)
            return to_string(thing);
          else
            return to_string(thing['class']);
        }
        else {
          to_string(thing);
        }
        break;

      case 'xml': // E4X
        return thing.toXMLString();
        break;
      case 'function':
        return thing.toString();
        break;
      case 'string':
        return print_string(thing);
        break;
      default:
        return to_string(thing);
        break;
      };
    };


  })();

  (function(){

    // Callback for eachr.
    var handler;

    // The config used by 'p'.
    var config;

    // The result string produced by 'p'.
    var str;

    // Pretty print a js entity.
    //
    // You can pass in your own configurations in the same
    // format as module.CONFIG.
    // In this way you can create your own variations:
    // eg
    //   var pp = function(thing) {
    //       return p(thing,{extended:{on:true,...},...});
    //   };

    module.p = function(thing,conf) {
      if(conf) {
        config = conf;
        // If conf is missing bits, put in defaults:
        if(!config.extended)
          config.extended={on:false};
        if(!config.max_levels)
          config.max_levels = 10;
      } else {
        config = module.CONFIG;
      }
      str = ''; // Reset str.
      module.eachr(thing,handler,config.max_levels);
      return str;
    };


    (function(){

      // Flag for indicating first item in array or object.

      var firstItem = false;

      // This function is designed to be called by eachr and
      // builds string 'str'.
      //
      // Params:
      // @thing The js thing associated with an eachr event if
      //        eachr passes it
      // @index Index of array or key of js object
      // @level Level of nesting
      // @hint  Additional information passed by eachr such as if
      //        the object is empty

      handler = function(event,index,thing,level,hint) {

        switch(event) {

          // ARRAYS:
        case module.EVENTS.arrayStart:
          if(level>=config.max_levels) {
            str+='[...';
          } else {
            str+='[';
          }
          break;
        case module.EVENTS.arrayItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.arrayItemStart:

          // Don't print the array's insides.
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }

          else {
            if(firstItem) firstItem = false;
            // Prepend comman to next entry.
            // Don't add linebreak, indent for arrays.
            else str+=',';
          }

          break;
        case module.EVENTS.arrayItemEnd:
          break;
        case module.EVENTS.arrayEnd:
          str+=']';
          break;

          // OBJECTS:
        case module.EVENTS.objectStart:
          if(level>config.max_levels) {
            // Nothing
          } else {
            if(hint && hint.empty) {
              str+='{';
            } else if(level==config.max_levels) {
              // Don't linebreak *at all* if we
              // are at the max level.
              str+='{...';
            } else {
              str+='{'+linebreak()+indent(level);
            }
          }
          break;
        case module.EVENTS.objectItemStartFirst:
          firstItem = true;
          break;
        case module.EVENTS.objectItemStart:
          if(level>=config.max_levels) {
            if(firstItem) firstItem = false;
          }
          else {
            if(firstItem) {
              firstItem = false;
            } else {
              // Add comma after previous item, break
              // and indent.
              str+=','+linebreak()+indent(level);
            }
            // Now print the key (index).
            // The value will get printed on the 'item' event.
            str+=index+':';
          }

          break;
        case module.EVENTS.objectItemEnd:
          break;
        case module.EVENTS.objectEnd:
          if(level>config.max_levels) {
            // Nothing
          }
          else if(level==config.max_levels) {
            str+='}';
          }
          else {
            if(hint && hint.empty) {
              str+='}';
            } else {
              str+=linebreak()+indent(level-1)+'}';
            }
          }
          //str+='}';
          break;

          // Print the actual thing.
        case module.EVENTS.item:
          str+=filter(module.to_string(thing));
          break;

        default:
          break;
        };
      };

      // Tidy up string in various ways.

      var filter = function(str) {
        if(!config.extended.on || config.length) {
          // Remove newlines and squeeze:
          str = str.replace(/\r?\n/g,'').replace(/  */g,' ');
          // Squeeze spaces around syntactical stuff:
          str = str.replace(/(\W) /g,'$1');
          str = str.replace(/ (\W)/g,'$1');
        }
        if(config.length) {
          var limit,len,remove;
          limit = config.length;
          len = str.length;
          remove = str.length-limit;
          if(str.length>limit) {
            str =
              '|'+
              str.substring(0,len/2-remove/2)+
              '...'+
              str.substring(len/2+remove/2,len)
              +'|';
          }
        }
        return str;
      };

      var indent = function(level) {
        var indent;
        if(config.extended.on) {
          for(indent='',i=0;i<level+1;i++) {
            if(config.extended.indent) {
              indent += config.extended.indent;
            }
            else {
              indent += module.CONFIG.extended.indent;
            }
          }
          return indent;
        } else {
          return '';
        }
      };

      var linebreak = function() {
        if(config.extended.on) {
          if(config.extended.newline)
            return config.extended.newline;
          else
            return module.CONFIG.extended.newline;
        } else {
          return '';
        }
      };

    })();
    
  })();

  return module;

}();

