define(['goo'], function(goo){
  console.log(goo);
  function Test(){
    this.a = new goo.Vector3();
  };
  Test.prototype.printStuff = function(){
    console.log(this.a);
  }
  return Test;
});
