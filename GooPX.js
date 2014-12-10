(function(window, undefined){
	'use strict';
	var GooPX = {};
	GooPX.System = function(settings){
		goo.System.call(this, 'GooPXSystem', ['RigidbodyComponent', 'TransformComponent']);
		settings = settings || {};
		_.defaults(settings, {
			gravity:goo.Vector3(0, -9.8, 0)
		});
		this.gravity = new goo.Vector3(settings.gravity);
		console.log('GooPX.System constructor');
	};
	GooPX.System.prototype = Object.create(goo.System.prototype);
	GooPX.System.constructor = GooPX.System;
	GooPX.System.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	if(ent.rigidbodyComponent){
	    		if(ent.rigidbodyComponent instanceof GooPX.RigidbodyComponent){
				// do something with RigidbodyComponent or entity here?
				if(undefined !== ent.colliderComponent){
					console.log('The entity already has a ColliderComponent');	
				}
				else{
					console.log('The entity does not have a ColliderComponent');
					ent.colliderComponent = 'collider'+Math.round(Math.random()*100);
				}
	    		}
	    	}
	};
	GooPX.System.prototype.deleted = function(ent){
		console.log('GooPX.System.deleted()');
		if(ent.rigidbodyComponent){
			if(ent.rigidbodyComponent instanceof GooPX.RigidbodyComponent){
				ent.clearComponent('RigidbodyComponent');
				ent.clearComponent('ColliderComponent');
				delete ent.colliderComponent;
			}
		}
		console.log(ent);
	};
	GooPX.System.prototype.process = function(entArr){
		console.log('GooPX.System.process()');
		for(var i = entArr.length-1; i > -1; i--){
			var ent = entArr[i];
			if(ent.rigidbodyComponent){
				console.log(ent.name+" has a RigidbodyComponent");
				if(ent.rigidbodyComponent.test123){
					console.log(ent.name+" has a test123:"+test123);
				}
				if(ent.colliderComponent){
					console.log(ent.name+" has a collider.");
				}
			}
		}
		
	};
  
	GooPX.RigidbodyComponent = function(settings){
		settings = settings || {};
		_.defaults(settings, {
			collider:undefined,
			mass:1.0,
			isKinematic:false,
			isTrigger:false,
			useGravity:true
		});
		this.type = 'RigidbodyComponent';
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.constructor = GooPX.RigidbodyComponent;

	var global = global || window;
	window.GooPX = GooPX;
}(window));
