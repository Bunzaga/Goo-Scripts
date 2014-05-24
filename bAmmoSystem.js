(function(window, document, undefined){
  function bAmmoSystem(){
  }
  
  bAmmoSystem.parameters = [
  {key:'gravity', type:'vec3', default[0.0, -9.8, 0.0]}];
  
  var global = global || window;
  global.bAmmoSystem = bAmmoSystem;
}(window, document));
