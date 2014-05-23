(function(window, document){
  var AmmoUtil = {};
  var pvec;
  
  AmmoUtil.setLinearVelocity = function(body, vec3){
  	pvec = pvec || new Ammo.btVector3();
  	pvec.setValue(vec3.x, vec3.y, vec3.z);
	body.setLinearVelocity(pvec);
  };
  var global = global || window;
  global.AmmoUtil = AmmoUtil;
}(window, document, undefined));
