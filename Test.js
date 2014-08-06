require(['goo'], function(goo){
  console.log(goo);
  var Test = function(){
    this.a = new goo.Vector3();
  };
  Test.prototype.printStuff = function(){
    console.log(a);
  }
  return Test;
});
