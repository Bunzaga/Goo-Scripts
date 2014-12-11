(function(window, undefined){
	'use strict';
	var GooPX = {};
	GooPX.System = function(settings){
		goo.System.call(this, 'GooPXSystem', ['RigidbodyComponent']);
		settings = settings || {};
		_.defaults(settings, {
			gravity:goo.Vector3(0, -9.8, 0)
		});
		this.gravity = new goo.Vector3(settings.gravity);
		this.world = {};
		console.log('GooPX.System constructor');
	};
	GooPX.System.prototype = Object.create(goo.System.prototype);
	GooPX.System.constructor = GooPX.System;
	GooPX.System.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	if(ent.rigidbodyComponent){
	    		if(ent.rigidbodyComponent instanceof GooPX.RigidbodyComponent){
				// do something with RigidbodyComponent or entity here
				if(undefined !== ent.rigidbodyComponent.collider){
					console.log('The entity already has a Collider,');
					console.log('will add it to the rigidbody to the physics system "as is".');
				}
				else{
					console.log('The entity does not have a ColliderComponent,');
					console.log('will create one, based on the MeshRendererComponent, or');
					console.log('create a compound collider.');
					ent.rigidbodyComponent.collider = GooPX.generateCollider(ent);
				}
				console.log(ent.rigidbodyComponent.collider);
	    		}
	    	}
	};
	GooPX.System.prototype.deleted = function(ent){
		console.log('GooPX.System.deleted()');
		if(ent.rigidbodyComponent){
			if(ent.rigidbodyComponent instanceof GooPX.RigidbodyComponent){
				delete ent.rigidbodyComponent.collider;
				ent.clearComponent('RigidbodyComponent');
			}
		}
		console.log(ent);
	};
	GooPX.System.prototype.process = function(entArr){
		console.log('GooPX.System.process()');
		// this.world.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
		// this.world.checkCollisions();
		for(var i = entArr.length-1; i > -1; i--){
			var ent = entArr[i];
			if(undefined !== ent.rigidbodyComponent){
				console.log(ent.name+" has a RigidbodyComponent");
				if(undefined !== ent.rigidbodyComponent.collider){
					console.log(ent.name+" has a collider.");
				}
				else{
					console.log("The Collider for "+ent.name+" has not been initialized yet!");
				}
			}
			else{
				console.log("The rigidbodyComponent for "+ent.name+" has not been initialized yet!");
			}
		}
	};
  
	GooPX.RigidbodyComponent = function(settings){
		this.type = 'RigidbodyComponent';
		settings = settings || {};
		_.defaults(settings, {
			mass:1.0,
			isKinematic:false,
			isTrigger:false,
			useGravity:true
		});
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.constructor = GooPX.RigidbodyComponent;
	
	GooPX.generateCollider = function(ent){
		var shape = undefined;
		if(ent.meshDataComponent && ent.meshDataComponent.meshData){
			var md = ent.meshDataComponent.meshData;
			if(md instanceof goo.Box){
				console.log('Goo Shape is a Box');
				shape = 'new GooPX.BoxCollider()';
			}
			else if(md instanceof goo.Sphere){
				console.log('Goo Shape is a Sphere');
				shape = 'new GooPX.SphereCollider()';
			}
			else if(md instanceof goo.Quad){
				console.log('Goo Shape is a Quad');
				shape = 'new GooPX.QuadCollider()';
			}
			else if(md instanceof goo.Cylinder){
				console.log('Goo Shape is a Cylinder');
				shape = 'new GooPX.CylinderCollider()';
			}
			else if(md instanceof goo.Cone){
				console.log('Goo Shape is a Cone');
				shape = 'new GooPX.ConeCollider()';
			}
			else if(md instanceof goo.Disk){
				console.log('Goo Shape is a Disk');
				shape = 'new GooPX.DiskCollider()';
			}
			// add one for capsule???
			else{
				console.log('Goo Shape is a StaticMesh');
				shape = 'new GooPX.StaticMeshCollider()';	
			}
		}
		else{
			console.log('This is a parent entity, no shape detected');
			shape = 'new GooPX.CompoundCollider()';
		}
		return shape;
	}

	var global = global || window;
	window.GooPX = GooPX;
}(window));
