(function(window, document, undefined){
  define('Test', ['goo/math/Vector3'], function(Vector3){
    var Test = {};
    var aVec = new Vector3(1,2,3);
  
    Test.printStuff = function(){
      console.log(aVec);
    }
    return Test;
  });
}(window, document));
