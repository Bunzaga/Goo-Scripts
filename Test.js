(function(window, document){
  var Test = {};

  Test.externals = [key:'Test', name:'Test 123', description:'Just a test', parameters:[{key:'int', type:'int', default:0}]];
  
  var global = global || window;
  global.Test = Test;
}(window, document, undefined));
