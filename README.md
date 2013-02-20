SchemaJS
========

What?
-----
Have you ever found yourself handling complicated, large, nested javascript objects and arrays or various nested combinations of the above and feeling lost?

Are you interested in events and signals and in having one part of your system emit a signal or piece of information maybe via a controller that routes this information to another part; in such a system, your components don't know as much about their receivers and especially what methods they might have, so that your system becomes more loosely coupled and the signals that are passed become just as important as the things that are passing them?

If you answered 'yes' to any of the above, you *may*, I stress, *may* be interested in schemajs.

As the name implies, schemajs is to arbitrarily nested js object and array structures what schemas are to xml... well, an initial exploration into as much.

Or it could quite possibly be the most useless thing I've ever written.  I haven't decided yet.

How?
----
Best place to go once reading this is probably the tests/ dir and see examples.

For the discussion below:
* D = definition (a blueprint for the form of your js data structure)
* V = value, an actual value eg number, string, function
* D|V = "D or V"

There are 4 types of defns:
* array, D = [D|V] (this means D is an array of nested defns or values)
* keyed array;  D = {_key_:D|V}
  Similar to array, except now you specify the key instead of an index.
* assoc array 
  This is like a keyed array, but the keys are fixed in the definition:
  {a:D|V,b:D|V,...} where a,b are specified set of keys
* values (V) (eg null,1,true,functions etc)
  This is like a terminal symbol in a grammar.

Each definition except for V, may be recursively defined So arrays
could be arrays of nested defns, similarly keyed arrays etc


Quick example:
--------------

The following says that D is an assoc array with one member 'a' that contains an array that can store items of the form '{b:null}'.  '{b:null}' in turn defines an assoc array with one key 'b' that can store anything.
```js
  var D = {a:[{b:null}]}
```
Now we create a generator that can create javascript objects of this form:
```js
  m = schema3.gen(D);
  s = m.make(function(o){
    o.a.push(function(o){
      o.b.set(10);
    });
    o.a.push(function(o){
      o.b.set(11);
    });
  });
```

's' becomes:
```js
  {a:[{b:10},{b:11}]}
```

Now go look at tests/.


Extending an existing instance
------------------------------
You can take an instance and update it like this:
```js
    m.withInstance(s,function(o){
      o.a.push(function(o){
        o.b.set(12);
      });
    });
```


Naming definitions and grouping them
------------------------------------
If you keep on with this sort of madness, you may find yourself wanting to be able to name these definitions (also referred to as "types").  And if you want to name them, it also makes sense to namespace the names, to say "this named thing belongs to this set of types".

Here we create a set of types called 'set1' and give it one "type" called 'foo':
```js
  set = sets.withNewSet('set1',function(o){
    // Make a definition:  (calls schema3.gen behind the scenes)
    o.add('foo',{
      a:[{b:null}]
    });
  });
```
Now we can make instances of our "types" in a similar way to the standalone example above:
```js
  s = set.types['foo'].make(function(o){...});
```


In practice, what this does is add 2 properties to instances generated via a set.
```js
  s._type_ = 'foo'
  s._set_ = 'set1'
```

Now suppose that you know of some component that emits information using a particular signal that comes from a particular set.
Then you can formalise this understanding by using 'receiversFor'.
'receiversFor' looks for _type_ and _set_ attributes.
It doesn't really attempt to validate.

```js
      r = sets.receiversFor(set,{
        foo:function(o){
          console.log(o);  // print this instance of set.types['foo'].
        }
      });
      r(s);  // Will process 's'.
```
