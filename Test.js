define('Test', ['goo/math/Vector3'], function(Vector3){
  console.log(goo);
  var Test = function(){
    this.a = new Vector3();
  };
  Test.prototype.printStuff = function(){
    console.log(this.a);
  }
  return Test;
});
