(function(window){
  Test = {};
  var v = new goo.Vector3();
  Test.printStuff = function(){
    console.log("Stuff");
    console.log(v);
  }
  var global = global || window;
  global.Test = Test;
}(window, undefined));
