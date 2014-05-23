(function(window, document){
  var AmmoUtil = {};
  var pvec = new Ammo.btVector3();
  AmmoUtil.setLinearVelocity = function(body, vec3){
    pvec.setValue(vec3.x, vec3.y, vec3.z);
		body.setLinearVelocity(pvec);
  }
  var global = global || window;
  global.AmmoUtil = AmmoUtil;
}(window, document, undefined));
