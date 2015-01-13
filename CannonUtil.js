(function(window, document, undefined){
  goo.CannonSystem = function(settings){
    goo.System.call(this, 'CannonSystem', ['RigidbodyComponent', 'ColliderComponent']);
    this.priority = 1;
    this.gravity = settings === undefined || settings.gravity === undefined ? new goo.Vector3() : settings.gravity;
    this.stepFrequency = settings === undefined || settings.stepFrequency === undefined ? 60 : settings.stepFrequency;
    this.broadphase = settings === undefined || settings.broadphase === undefined ? 'naive' : settings.broadphase;
    this.maxSubSteps = settings === undefined || settings.maxSubSteps === undefined ? 0 : settings.maxSubSteps;
    
    var world = this.world = new CANNON.World();
		world.gravity.x = this.gravity.x;
		world.gravity.y = this.gravity.y;
		world.gravity.z = this.gravity.z;
		this.setBroadphaseAlgorithm(this.broadphase);
  };
  goo.RigidbodyComponent = function(){
    goo.Component.call(this, arguments);
    this.type = 'RigidbodyComponent';
  };
  goo.ColliderComponent = function(){
    goo.Component.call(this, arguments);
    this.type = 'ColliderComponent';
  };
  
}(window, document));
