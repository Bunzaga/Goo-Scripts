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
		console.log(this);
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
					ent.rigidbodyComponent.entity = ent;
				}
				console.log(ent.rigidbodyComponent.collider);
				console.log(ent.rigidbodyComponent.collider.translation.x+','+ent.rigidbodyComponent.collider.translation.y+','+ent.rigidbodyComponent.collider.translation.z);
	    		}
	    	}
	};
	GooPX.System.prototype.deleted = function(ent){
		console.log('GooPX.System.deleted()');
		if(ent.rigidbodyComponent){
			if(ent.rigidbodyComponent instanceof GooPX.RigidbodyComponent){
				ent.rigidbodyComponent.destroy();
				ent.clearComponent('RigidbodyComponent');
			}
		}
		console.log(ent);
	};
	function makeRed(child){
		console.log(child);
		if(child.meshRendererComponent){
			child.meshRendererComponent.materials[0].diffuseColor = [1, 0, 0];
		}
	}
	function makeGrey(child){
		if(child.meshRendererComponent){
			child.meshRendererComponent.materials[0].diffuseColor = [0.25, 0.25, 0.25];
		}
	}
	GooPX.System.prototype.process = function(entArr){
		console.log('GooPX.System.process()');
		// this.world.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
		// this.world.checkCollisions();
		for(var i = entArr.length-1; i > -1; i--){
			var entA = entArr[i];
			if(entA !== undefined){
				for(var j = i-1; j > -1; j--){
					var entB = entArr[j];
					if(entB !== undefined){
						var collision = GooPX.checkCollision(entA.rigidbodyComponent.collider, entB.rigidbodyComponent.collider);
						if(collision.bool === true){
							entA.traverse(makeRed);
							entB.traverse(makeRed);
						}
						else{
							entA.traverse(makeGrey);
							entB.traverse(makeGrey);	
						}
					}
				}
			}
		}
	};
	GooPX.System.prototype.cleanup = function(){
		for (var i = 0, ent; ent = this._activeEntities[i++];) {
			this.deleted(ent);
		}
		GooPX.RigidbodyComponent.pool.length = 0;
		GooPX.SphereCollider.pool.length = 0;
		GooPX.CollisionData.pool.length = 0;
		console.log('Cleaned up!');
	};
  
	GooPX.RigidbodyComponent = function(){};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.constructor = GooPX.RigidbodyComponent;
	GooPX.RigidbodyComponent.pool = [];
	GooPX.RigidbodyComponent.create = function(settings){
		settings = settings || {};
		_.defaults(settings, {
			mass:1.0,
			isKinematic:false,
			isTrigger:false,
			useGravity:true
		});
		var rbc = GooPX.RigidbodyComponent.pool.length === 0 ? new GooPX.RigidbodyComponent() : GooPX.RigidbodyComponent.pool.shift();
		rbc.type = 'RigidbodyComponent';
		rbc.mass = settings.mass;
		rbc.isKinematic = settings.isKinematic;
		rbc.isTrigger = settings.isTrigger;
		rbc.useGravity = settings.useGravity;
		return rbc;
	};
	GooPX.RigidbodyComponent.prototype.destroy = function(){
		if(this.collider){
			this.collider.destroy();
			delete this.collider;
		}
		this.mass = 1.0;
		this.isKinematic = false;
		this.isTrigger = false;
		this.useGravity = true;
		delete this.entity;
		GooPX.RigidbodyComponent.pool.push(this);
	};
	
	GooPX.generateCollider = function(ent){
		var shape = undefined;
		if(ent.meshDataComponent && ent.meshDataComponent.meshData){
			scl.copy(ent.transformComponent.worldTransform.scale);
			var md = ent.meshDataComponent.meshData;
			if(md instanceof goo.Sphere){
				console.log('Goo Shape is a Sphere');
				shape = GooPX.SphereCollider.create(ent.transformComponent.worldTransform.translation, md.radius * scl.x);
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
			shape.entity = ent;
		}
		else{
			console.log('This is a parent entity or no MeshData');
			shape = 'new GooPX.CompoundCollider()';
		}
		return shape;
	};

	GooPX.checkCollision = function(a, b){
		switch(a.type){
			case 'Sphere':
				switch(b.type){
					case 'Sphere':
						var rDist = a.radius + b.radius;
						var tDist = goo.Vector3.sub(a.translation, b.translation, vec).length();
						var dist = tDist - rDist;
						return GooPX.CollisionData.create((tDist < rDist), dist);
						break;
				}
				break;
		}
	};
	
	GooPX.SphereCollider = function(){};
	GooPX.SphereCollider.pool = [];
	GooPX.SphereCollider.create = function(translation, radius){
		var collider = (GooPX.SphereCollider.pool.length === 0) ? new GooPX.SphereCollider() : GooPX.SphereCollider.pool.shift();
		collider.type = 'Sphere';
		collider.translation = translation;
		collider.radius = radius;
		return collider;
	};
	GooPX.SphereCollider.prototype.destroy = function(){
		this.radius = 0.5;
		this.translation = undefined;
		delete this.entity;
		GooPX.SphereCollider.pool.push(this);
	};
	
	GooPX.CollisionData = function(){};
	GooPX.CollisionData.pool = [];
	GooPX.CollisionData.create = function(bool, distance){
		var collision = (GooPX.CollisionData.pool.length === 0) ? new GooPX.CollisionData() : collision = GooPX.CollisionData.pool.shift();
		collision.bool = bool;
		collision.distance = distance;
		return collision;
	};
	GooPX.CollisionData.prototype.destroy = function(){
		this.bool = false;
		this.distance = 0.0;
		GooPX.CollisionData.pool.push(this);
	};
	
	var global = global || window;
	window.GooPX = GooPX;
}(window));
