(function(window, document, undefined){
	var GooPX = {};
	GooPX.CannonSystem = function(settings){
		goo.System.call(this, 'GooPXSystem', ['RigidbodyComponent', 'ColliderComponent']);
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
	GooPX.CannonSystem.prototype = Object.create(goo.System.prototype);
	GooPX.CannonSystem.prototype.constructor = GooPX.CannonSystem;
  
	GooPX.CannonSystem.prototype.setBroadphaseAlgorithm = function(algorithm){
		var world = this.world;
		switch(algorithm){
		case 'naive':
			world.broadphase = new CANNON.NaiveBroadphase();
			break;
		case 'sap':
			world.broadphase = new CANNON.SAPBroadphase(world);
			break;
		default:
			throw new Error('Broadphase not supported: ' + algorithm);
		}
	};
  
  GooPX.RigidbodyComponent = function(){
    goo.Component.call(this, arguments);
    this.type = 'RigidbodyComponent';
  };
  GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
  GooPX.RigidbodyComponent.prototype.constructor = GooPX.RigidbodyComponent;
  
  GooPX.ColliderComponent = function(){
    goo.Component.call(this, arguments);
    this.type = 'ColliderComponent';
  };
  GooPX.ColliderComponent.prototype = Object.create(goo.Component.prototype);
  GooPX.ColliderComponent.prototype.constructor = GooPX.ColliderComponent;
  
  var global = global || window;
  window.GooPX = GooPX;
}(window, document));
