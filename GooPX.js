(function(window, undefined){
	'use strict';
	var scl = new goo.Vector3();
	var vec = new goo.Vector3();
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
				}
				else{
					console.log('The entity does not have a Collider(adding one),');
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
			scl.copy(ent.transformComponent.worldTransform.scale);
			var md = ent.meshDataComponent.meshData;
			if(md instanceof goo.Sphere){
				console.log('Goo Shape is a Sphere');
				shape = new GooPX.SphereCollider(ent.transformComponent.worldTransform.translation, md.radius * scl.x);
			}
			else if(md instanceof goo.Box){
				console.log('Goo Shape is a Box');
				shape = 'new GooPX.BoxCollider()';
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
			console.log('MeshData:');
			console.log(ent.meshDataComponent.meshData);
		}
		else{
			console.log('This is a parent entity or no MeshData');
			shape = 'new GooPX.CompoundCollider()';
		}
		return shape;
	}
	GooPX.SPHERE = 0;
	GooPX.checkOverlap = function(a, b){
		switch(a.type){
			case:GooPX.SPHERE:
				switch(b.type){
					case:GooPX.SPHERE:
						var rDist = a.radius + b.radius;
						var tDist = goo.Vector3.sub(a.translation, b.translation, vec).length();
						var dist = cDist - rDist;
						return new CollisionData((cDist < rDist), dist);
						break;
				}
				break;
		}
	}
	GooPX.SphereCollider = function(translation, radius){
		this.radius = r || 0.5;
		this.translation = translation;
		this.type = GooPX.SPHERE;
	}
	GooPX.CollisionData = function(bool, distance){
		this.bool = bool;
		this.distance = distance;
	};
	GooPX.CollisionData.create = function(){
		
	};
	GooPX.CollisionData.destroy = function(){
		
	};
	
	var global = global || window;
	window.GooPX = GooPX;
}(window));
