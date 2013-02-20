// See dev-globals.js .

// These are some test definitions, don't include the label!
var examples = {
  a01:1,
  a02:null,
  b01:[],
  b02:[2],
  b03:[{}],
  b04:[{x:2,y:3}],
  b05:[[{x:1}]],
  c01:{},
  c02:{x:2,y:3},
  d01:{_key_:1},
  d02:{_key_:{x:1,y:2}},
  d03:{_key_:{_key_:{x:1}}},
  e01:{x:2,y:{_key_:{x:1}}},
  e02:{x:2,y:{_key_:null}},
  e03:{x:2,y:{a:{b:2}}},
  f01:{x:[{y:null}]}
};


tests.items.push(with_tests$('01.utils',function(M){

  M.tests('Sets and receivers',function(M){
    M.test('Create basic set and use it...',function(){
      var s,r,result;

      // Make a set.
      var set = sets.withNewSet('set1',function(o){
        // Make a definition:
        o.add('foo',{
          a:[{b:null}]
        });
      });

      // Use it:
      s = set.types.foo.make(function(o){
        o.a.add(function(o){
          o.push(function(o){
            o.b.set(10);
          })
        });
        // Shortcut:
        o.a.push(function(o){
          o.b.set('using push!');
        });
      });
      
      //console.log(s);
      this.assertEquals("Set instances have a _type_.",s._type_,'foo');
      this.assertEquals("Set instances have a _set_.",s._set_,'set1');
      this.assert(s.a[0].b == 10);
      this.assert(s.a[1].b == 'using push!');


    });
    M.test('Create receivers for a set...',function(){
      var r,s,result,set;

      set = sets.withNewSet('set1',function(o){
        // Make a definition:
        o.add('foo',{
          a:[{b:null}]
        });
      });
      s = set.types.foo.make(function(o){
        o.a.push(function(o){
          o.b.set(2);
        });
      });

      result = {called:0,o:null};
      r = sets.receiversFor(set,{
        foo:function(o){
          result.called++;
          result.o = o;
          console.log(o);
        }
      });
      r(s);

      this.assertEquals("receiversFor processed foo signal.",
                        1,result.called);
      this.assert("receiversFor passed in the foo signal",
                  result.o.a[0].b == 2);
    });

  });


}));


/*
$dlb_id_au$.domutils.schema3_tests = function(){

  var module = {};

  // Test various defns:

  module.withExample1(function(o){
    var m,s;

    console.log('a01');
    m = schema3.gen(o.a01);
    s = m.make(function(o){
      o.set(8);
    });
    console.log(s);

    console.log('b04');
    m = schema3.gen(o.b04);
    s = m.make(function(o){
      o.push(function(o){
        o['x'].set(24);
      });
    });
    m.withInstance(s,function(o){
      o.push(function(o){
        o['x'].set(27);
      });
    });
    console.log(s);

    console.log('b04 map');
    m = schema3.gen(o.b04);
    s = m.make(function(o){
      o.map({a:1,b:2},function(o,v,k){
        o.x.set(v);
        o.y.set(k);
      });
    });
    console.log(s);

    console.log('b05');
    m = schema3.gen(o.b05);
    s = m.make(function(o){
      o.push(function(o){
        o.push(function(o){
          o['x'].set(113);
        });
        o.push(function(o){
          o['x'].set(114);
        });
      });
      o.push(function(o){
        o.push(function(o){
          o['x'].set(115);
        });
      });
    });
    console.log(s);
    m.withInstance(s,function(o){
      o.push(function(o){
        o.push(function(o){
          o['x'].set(2020);
        });
      })
    });
    console.log(s);

    console.log('c02');
    m = schema3.gen(o.c02);
    s = m.make(function(o){
      o['x'].set(4);
      o['y'].set(7);
    });
    console.log(s);

    console.log('c02 2');
    s = m.make(function(o){
      o['x'].set(44);
    });
    console.log(s);

    console.log('d02');
    m = schema3.gen(o.d02);
    s = m.make(function(o){
      o.addKey('foo',function(o){
        o['x'].set('x1');
        o['y'].set('y1');
      });
      o.addKey('foo2',function(o){
        o['x'].set(12);
      });
    });
    console.log(s);

    console.log('d02 map');
    m = schema3.gen(o.d02);
    s = m.make(function(o){
      o.map({a:1,b:2},function(o,v,k){
        o['x'].set(v);
        o['y'].set(k);
      });
    });
    console.log(s);

    console.log('d03');
    m = schema3.gen(o.d03);
    s = m.make(function(o){
      o.addKey('foo',function(o){
        o.addKey('bar',function(o){
          o['x'].set(112);
        });
      });
      o.addKey('foo2',function(o){
        o.addKey('baaaar',function(o){
          o['x'].set(12);
        });
      });
    });
    console.log(s);

    console.log('e01');
    m = schema3.gen(o.e01);
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].add(function(o){
        o.addKey('foo',function(o){
          o.x.set(10);
        });
        o.addKey('fur',function(o){
          o.x.set(12);
        });
      });
      o['y'].add(function(o){
        o.addKey('foo2',function(o){
          o.x.set(11);
        });
      });
      o['y'].addKey('bar',function(o){
        o.x.set(25);
      });
      o['y'].addKey('bar2',function(o){
        o.x.set(25);
      });
    });
    console.log(s);

    console.log('e01 2 shortcut');
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].add(function(o){
        o.addKey('foo',function(o){
          o.x.set(10);
        });
      });
      o['y'].addKey('foo2',function(o){
        o.x.set(11);
      });
    });
    console.log(s);

    console.log('e01 3 map');
    s = m.make(function(o){
      o['x'].set(42);
      o['y'].map({a:1,b:2},function(o,v,k){
        o.x.set(v);
      });
      o['y'].map(
        {c:1,d:2},
        function(o,v,k){o.x.set(k);},
        function(v,k){return v;}
      );
    });
    console.log(s);

    console.log('e02');
    m = schema3.gen(o.e02);
    s = m.make(function(o){
      o['x'].set(12);
      o['y'].add(function(o){
        o.addKey('foo','f*k');
      });
      o['y'].addKey('bar',"f*k2");
    });
    console.log(s);

    console.log('e03');
    m = schema3.gen(o.e03);
    s = m.make(function(o){
      o['x'].set(122);
      o['y'].add(function(o){
        o['a'].add(function(o){
          o['b'].set(123);
        });
      });
    });
    console.log(s);

    console.log('f01');
    m = schema3.gen(o.f01);
    s = m.make(function(o){
      o['x'].push(function(o){
        o.y.set(50);
      });
      o['x'].map([1,2,3],function(o,v,k){
        o.y.set(v);
      });
    });
    console.log(s);

  });

  return module;

}();
*/
