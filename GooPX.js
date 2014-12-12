(function(window, undefined){
	'use strict';
	var scl = new goo.Vector3();
	var vec = new goo.Vector3();
	var GooPX = {};
	GooPX.System = function(settings){
		goo.System.call(this, 'GooPXSystem', ['RigidbodyComponent', 'ColliderComponent']);
		this.priority = 1;
		this.gravity = new goo.Vector3(settings.gravity || 0, -9.8, 0);
		this.world = {};
		console.log(this);
		console.log('GooPX.System constructor');
	};
	GooPX.System.prototype = Object.create(goo.System.prototype);
	GooPX.System.constructor = GooPX.System;
	GooPX.System.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	if(undefined === ent.rigidbodyComponent){console.log('No RigidbodyComponent!');return;}
		// do something with RigidbodyComponent or entity here
		if(undefined === ent.colliderComponent){
			console.log('The entity does not have a ColliderComponent(adding one),');
			ent.setComponent(GooPX.ColliderComponent.create(GooPX.generateCollider(ent)));
		}
		else{
			console.log('The entity already has a ColliderComponent,');
			if(undefined === ent.colliderComponent.collider){
				console.log('No collider in the ColliderComponent, creating one.');
				ent.colliderComponent.collider = GooPX.generateCollider(ent);
			}
		}
	};
	GooPX.System.prototype.deleted = function(ent){
		console.log('GooPX.System.deleted()');
		if(ent.colliderComponent){
			ent.colliderComponent.destroy();
		}
		if(ent.rigidbodyComponent){
			ent.rigidbodyComponent.destroy();
		}
		//console.log('Clearing ColliderComponent');
		//ent.clearComponent('ColliderComponent').bind(ent);
		console.log('Clearing RigidbodyComponent');
		ent.clearComponent('RigidbodyComponent').bind(ent);
		console.log(ent);
	};
	function makeRed(child){
		if(child.meshRendererComponent){
			child.meshRendererComponent.materials[0].uniforms.materialDiffuse = [1, 0, 0, 1];
		}
	}
	function makeGrey(child){
		if(child.meshRendererComponent){
			child.meshRendererComponent.materials[0].uniforms.materialDiffuse = [0.25, 0.25, 0.25, 1.0];
		}
	}
	GooPX.System.prototype.process = function(entArr){
		console.log('GooPX.System.process()');
		// this.world.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
		// this.world.checkCollisions();
		for(var i = entArr.length-1; i > -1; i--){
			var ent = entArr[i];
			ent.collided = false;
		}
		for(var i = entArr.length-1; i > -1; i--){
			var entA = entArr[i];
			if(entA !== undefined){
				for(var j = i-1; j > -1; j--){
					var entB = entArr[j];
					if(entB !== undefined){
						var collision = GooPX.checkCollision(entA, entB);
						if(collision.bool === true){
							entA.traverse(makeRed);
							entB.traverse(makeRed);
							entA.collided = true;
							entB.collided = true;
						}
						else{
							if(entA.collided === false){
								entA.traverse(makeGrey);
							}
							if(entB.collided === false){
								entB.traverse(makeGrey);
							}
						}
					}
				}
			}
		}
	};
	GooPX.System.prototype.cleanup = function(){
		for (var i = this._activeEntities.length-1; i > -1; i--) {
			var ent = this._activeEntities[i];
			this.deleted(ent);
		}
		GooPX.RigidbodyComponent.pool.length = 0;
		GooPX.ColliderComponent.pool.length = 0;
		GooPX.SphereCollider.pool.length = 0;
		GooPX.CollisionData.pool.length = 0;
		console.log('Cleaned up!');
	};
  
	GooPX.RigidbodyComponent = function(){};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.constructor = GooPX.RigidbodyComponent;
	GooPX.RigidbodyComponent.pool = [];
	GooPX.RigidbodyComponent.create = function(settings){
		console.log('GooPX.RigidbodyComponent.create()');
		var rbc = GooPX.RigidbodyComponent.pool.length === 0 ? new GooPX.RigidbodyComponent() : GooPX.RigidbodyComponent.pool.shift();
		rbc.type = 'RigidbodyComponent';
		rbc.mass = settings.mass || 1.0;
		rbc.isKinematic = settings.isKinematic || false;
		rbc.isTrigger = settings.isTrigger || false;
		rbc.useGravity = settings.useGravity || true;
		return rbc;
	};
	GooPX.RigidbodyComponent.prototype.destroy = function(){
		console.log('GooPX.RigidbodyComponent.destroy()');
		this.mass = 1.0;
		this.isKinematic = false;
		this.isTrigger = false;
		this.useGravity = true;
		GooPX.RigidbodyComponent.pool.push(this);
		console.log('done destroying rigidbody');
	};
	
	GooPX.ColliderComponent = function(){};
	GooPX.ColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.ColliderComponent.constructor = GooPX.ColliderComponent;
	GooPX.ColliderComponent.pool = [];
	GooPX.ColliderComponent.create = function(collider){
		console.log('GooPX.ColliderComponent.create()');
		console.log(collider);
		var cc = GooPX.ColliderComponent.pool.length === 0 ? new GooPX.ColliderComponent() : GooPX.ColliderComponent.pool.shift();
		cc.type = 'ColliderComponent';
		cc.collider = collider;
		return cc;
	};
	GooPX.ColliderComponent.prototype.destroy = function(){
		console.log('GooPX.ColliderComponent.destroy()');
		if(undefined !== this.collider){
			console.log('the collider exists...');
			this.collider.destroy();
		}
		this.collider = undefined;
		console.log('set this.collider to undefined');
		GooPX.ColliderComponent.pool.push(this);
	};
	
	GooPX.generateCollider = function(ent){
		var shape = undefined;
		if(ent.meshDataComponent && ent.meshDataComponent.meshData){
			scl.copy(ent.transformComponent.worldTransform.scale);
			var md = ent.meshDataComponent.meshData;
			if(md instanceof goo.Sphere){
				console.log('Goo Shape is a Sphere');
				shape = GooPX.SphereCollider.create(md.radius * scl.x);
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
	};

	GooPX.checkCollision = function(entA, entB){
		var colA = entA.colliderComponent.collider;
		var colB = entB.colliderComponent.collider;
		switch(colA.type){
			case 'Sphere':
				switch(colB.type){
					case 'Sphere':
						var rDist = colA.radius + colB.radius;
						var tDist = goo.Vector3.sub(entA.transformComponent.worldTransform.translation, entB.transformComponent.worldTransform.translation, vec).length();
						var dist = tDist - rDist;
						return GooPX.CollisionData.create((tDist < rDist), dist);
						break;
				}
				break;
		}
	};
	
	GooPX.SphereCollider = function(){};
	GooPX.SphereCollider.pool = [];
	GooPX.SphereCollider.create = function(radius){
		var collider = (GooPX.SphereCollider.pool.length === 0) ? new GooPX.SphereCollider() : GooPX.SphereCollider.pool.shift();
		collider.type = 'Sphere';
		collider.radius = radius;
		return collider;
	};
	GooPX.SphereCollider.prototype.destroy = function(){
		console.log('GooPX.SphereCollider.prototype.destroy');
		this.radius = 0.5;
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
