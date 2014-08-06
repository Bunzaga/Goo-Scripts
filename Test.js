require.config({
      paths: {
          'goo.js': 'https://code.gooengine.com/0.10.8/lib/goo.js'
      }
  });

require(['goo.js'], function(goo){
  console.log(goo);
  function Test(){
    this.a = new goo.Vector3();
  };
  Test.prototype.printStuff = function(){
    console.log(a);
  }
  return Test;
});
