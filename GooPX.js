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
			ent.clearComponent('ColliderComponent');
		}
		if(ent.rigidbodyComponent){
			ent.clearComponent('RigidbodyComponent');
		}
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
		GooPX.BoxCollider.pool.length = 0;
		console.log('Cleaned up!');
	};

	GooPX.RigidbodyComponent = function(){goo.Component.call(this);};
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
	}
	//GooPX.RigidbodyComponent.prototype.attached = function(ent){};
	GooPX.RigidbodyComponent.prototype.detached = function(ent){
		console.log('GooPX.RigidbodyComponent.destroy()');
		this.mass = 1.0;
		this.isKinematic = false;
		this.isTrigger = false;
		this.useGravity = true;
		GooPX.RigidbodyComponent.pool.push(this);
		console.log('done destroying rigidbody');
	};
	
	GooPX.ColliderComponent = function(){goo.Component.call(this);};
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
	//GooPX.ColliderComponent.prototype.attached = function(ent){};
	GooPX.ColliderComponent.prototype.detached = function(ent){
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
				console.log(md);
				shape = GooPX.BoxCollider.create(md.xExtent * scl.x, md.yExtent * scl.y, md.zExtent * scl.z);
			}
			else if(md instanceof goo.Quad){
				console.log('Goo Shape is a Quad');
				shape = 'new GooPX.QuadCollider()';
			}
			else if(md instanceof goo.Cylinder){
				console.log('Goo Shape is a Cylinder');
				shape = GooPX.CylinderCollider.create(scl.x * md.radius, scl.z * md.height * 0.5);
			}
			else if(md instanceof goo.Cone){
				console.log('Goo Shape is a Cone');
				console.log(md);
				shape = GooPX.ConeCollider.create(scl.x * md.radius, scl.z * md.height);
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
	
	var AB = new goo.Vector3(); // Direction A to B
	var R = new goo.Matrix3x3(); // 3x3 Rotation
	var AbsR = new goo.Matrix3x3(); // 3x3 Rotation
	var AX = new goo.Vector3(); // A Axis
	var BX = new goo.Vector3(); // B Axis
	
	GooPX.Box_BoxSupport = function(entA, entB){
		var ar = 0, br = 0;
		var aRot = entA.transformComponent.worldTransform.rotation;
		var bRot = entB.transformComponent.worldTransform.rotation;
		
		var aExt = entA.colliderComponent.collider.extents.data;
		var bExt = entB.colliderComponent.collider.extents.data;

		for(var i = 0, i1 = 0; i < 3; i++, i1+=3){
			AX.setDirect(aRot[i1], aRot[i1+1], aRot[i1+2]);
			for (var j = 0, j1 = 0; j < 3; j++, j1+=3){
				BX.setDirect(bRot[j1], bRot[j1+1], bRot[j1+2]);
				R.data[i1+j] = goo.Vector3.dot(AX, BX);
			}
		}
		
		AB.copy(entB.transformComponent.worldTransform.translation).subVector(entA.transformComponent.worldTransform.translation);
		AB.setDirect(AB.dot(AX.setDirect(aRot[0], aRot[1], aRot[2])), AB.dot(AX.setDirect(aRot[3], aRot[4], aRot[5])), AB.dot(AX.setDirect(aRot[6], aRot[7], aRot[8])));
		
		for(var i = 0; i < 9; i++){
			AbsR.data[i] = Math.abs(R[i]) + 0.00001;
		}
		// Test axes L = A0, L = A1, L = A2
		for(var i = 0, i1 = 0; i < 3; i++, i1+=3) {
			ar = aExt[i];
			br = (bExt[0] * AbsR.data[i1]) + (bExt[1] * AbsR.data[i1+1]) + (bExt[2] * AbsR.data[i1+2]);
			if(Math.abs(AB.data[i]) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		}
		// Test axes L = B0, L = B1, L = B2
		for(var i = 0; i < 3; i++) {
			ar = (aExt[0] * AbsR.data[i]) + (aExt[1] * AbsR.data[i+3]) + (aExt[2] * AbsR.data[i+6]);
			br = bExt[i];
			if(Math.abs((AB.data[0] * R.data[i]) + (AB.data[1] * R.data[i+3]) + (AB.data[2] * R.data[i+6])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		}
		// Test axis L = A0 x B0
		ar = (aExt[1] * AbsR.data[6]) + (aExt[2] * AbsR.data[3]);
		br = (bExt[1] * AbsR.data[2]) + (bExt[2] * AbsR.data[1]);
		if(Math.abs(AB.data[2] * R.data[3] - AB.data[1] * R.data[6]) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A0 x B1
		ar = (aExt[1] * AbsR.data[7]) + (aExt[2] * AbsR.data[4]);
		br = (bExt[0] * AbsR.data[2]) + (bExt[2] * AbsR.data[0]);
		if(Math.abs((AB.data[2] * R.data[4]) - (AB.data[1] * R.data[7])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A0 x B2
		ar = aExt[1] * AbsR.data[8] + aExt[2] * AbsR.data[5];
		br = bExt[0] * AbsR.data[1] + bExt[1] * AbsR.data[0];
		if(Math.abs((AB.data[2] * R.data[5]) - (AB.data[1] * R.data[8])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A1 x B0
		ar = (aExt[0] * AbsR.data[6]) + (aExt[2] * AbsR.data[0]);
		br = (bExt[1] * AbsR.data[5]) + (bExt[2] * AbsR.data[4]);
		if(Math.abs((AB.data[0] * R.data[6]) - (AB.data[2] * R.data[0])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A1 x B1
		ar = (aExt[0] * AbsR.data[7]) + (aExt[2] * AbsR.data[1]);
		br = (bExt[0] * AbsR.data[5]) + (bExt[2] * AbsR.data[3]);
		if(Math.abs((AB.data[0] * R.data[7]) - (AB.data[2] * R.data[1])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A1 x B2
		ar = (aExt[0] * AbsR.data[2][2]) + (aExt[2] * AbsR.data[0][2]);
		br = (bExt[0] * AbsR.data[1][1]) + (bExt[1] * AbsR.data[1][0]);
		if(Math.abs((AB.data[0] * R.data[8]) - (AB.data[2] * R.data[2])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A2 x B0
		ar = (aExt[0] * AbsR.data[3]) + (aExt[1] * AbsR.data[0]);
		br = (bExt[1] * AbsR.data[8]) + (bExt[2] * AbsR.data[7]);
		if(Math.abs((AB.data[1] * R.data[0]) - (AB.data[0] * R.data[3])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A2 x B1
		ar = (aExt[0] * AbsR.data[4]) + (aExt[1] * AbsR.data[1]);
		br = (bExt[0] * AbsR.data[8]) + (bExt[2] * AbsR.data[6]);
		if(Math.abs((AB.data[1] * R.data[1]) - (AB.data[0] * R.data[4])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		// Test axis L = A2 x B2
		ar = (aExt[0] * AbsR.data[4]) + (aExt[1] * AbsR.data[2]);
		br = (bExt[0] * AbsR.data[7]) + (bExt[1] * AbsR.data[6]);
		if(Math.abs((AB.data[1] * R.data[2]) - (AB.data[0] * R.data[5])) > (ar + br)){return new GooPX.CollisionData(false, 0);}
		return new GooPX.CollisionData(true, 0);
	}
	
	GooPX.Sphere_SphereSupport = function(entA, entB){
		AB.copy(entB.transformComponent.worldTransform.translation).subVector(entA.transformComponent.worldTransform.translation);
		var diff = AB.length() - (entA.colliderComponent.collider.radius + entB.colliderComponent.collider.radius);
		return new GooPX.CollisionData(diff < 0, Math.abs(diff));
	};

	GooPX.Sphere_BoxSupport = function(entA, entB){
		CA.copy(entA.transformComponent.worldTransform.translation);
		PT1.copy(entB.transformComponent.worldTransform.translation);
		AB.copy(CA).subVector(PT1);
		
		var rot = entB.transformComponent.worldTransform.rotation.data;
		var extents = entB.colliderComponent.collider.extents.data;
 
		for(var i = 0, i1 = 0; i < 3; i++, i1+=3){
			AX.setDirect(rot[i1], rot[i1+1], rot[i1+2]);
			var ext = extents[i];
			var dist = AB.dot(AX);
			if(dist > ext){dist = ext;}
			if(dist < -ext){dist = -ext;}
			PT1.addVector(AX.mul(dist));
		}
		
		vec.copy(PT1).subVector(CA);
		var diff = vec.length() - entA.colliderComponent.collider.radius;
		return new GooPX.CollisionData(diff < 0, Math.abs(diff));
	};
	GooPX.Box_SphereSupport = function(entA, entB){
		return GooPX.Sphere_BoxSupport(entB, entA);
	}
	GooPX.Cylinder_CylinderSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	var PT1 = new goo.Vector3();
	var PT2 = new goo.Vector3();
	var CA = new goo.Vector3();
	var CB = new goo.Vector3();
	GooPX.Cylinder_SphereSupport = function(entA, entB){
		CA.copy(entA.transformComponent.worldTransform.translation);
		CB.copy(entB.transformComponent.worldTransform.translation);
		R.copy(entA.transformComponent.worldTransform.rotation);
		AX.setDirect(R.data[6], R.data[7], R.data[8]);
		BX.copy(AX);
		AX.invert();
		
		var hr = entA.colliderComponent.collider.halfHeight + entB.colliderComponent.collider.radius;
		var rr = entA.colliderComponent.collider.radius + entB.colliderComponent.collider.radius;
		
		PT1.copy(AX).mul(hr);
		PT2.copy(BX).mul(hr);
		PT1.addVector(CA);
		PT2.addVector(CA);
		
		var p1 = entA._world.by.name('_Point1').first();
		p1.transformComponent.transform.translation.copy(PT1);
		p1.transformComponent.transform.scale.setDirect(entA.colliderComponent.collider.radius,entA.colliderComponent.collider.radius,entA.colliderComponent.collider.radius);
		p1.transformComponent.setUpdated();
		var p2 = entA._world.by.name('_Point2').first();
		p2.transformComponent.transform.translation.copy(PT2);
		p2.transformComponent.transform.scale.setDirect(entA.colliderComponent.collider.radius,entA.colliderComponent.collider.radius,entA.colliderComponent.collider.radius);
		p2.transformComponent.setUpdated();
		
		AB.copy(PT1).subVector(CB);
		var distance = AB.dot(AX);
		if(distance < 0){
			return new GooPX.CollisionData(false, 0);
		}
		AB.copy(PT2).subVector(CB);
		if(AB.dot(AX) < 0){
			return new GooPX.CollisionData(false, 0);
		}
		AB.copy(vec.copy(AX).mul(distance)).subVector(CB);
		var centerDistance = AB.distance(PT1);
		if(centerDistance > rr){
			return new GooPX.CollisionData(false, 0);
		}
		return new GooPX.CollisionData(true, 0);
	}
	GooPX.Sphere_CylinderSupport = function(entA, entB){
		return GooPX.Cylinder_SphereSupport(entB, entA);
	};
	GooPX.Cylinder_BoxSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	GooPX.Box_CylinderSupport = function(entA, entB){
		return GooPX.Cylinder_BoxSupport(entB, entA);
	};
	GooPX.Cone_ConeSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	GooPX.Cone_SphereSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	GooPX.Cone_CylinderSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	GooPX.Cone_BoxSupport = function(entA, entB){
		return new GooPX.CollisionData(false, 0);
	};
	GooPX.Sphere_ConeSupport = function(entA, entB){
		return GooPX.Cone_SphereSupport(entB, entA);
	};
	GooPX.Cylinder_ConeSupport = function(entA, entB){
		return GooPX.Cone_CylinderSupport(entB, entA);
	};
	GooPX.Box_ConeSupport = function(entA, entB){
		return GooPX.Cone_BoxSupport(entB, entA);
	};
	
	GooPX.checkCollision = function(entA, entB){
		console.log('GooPX.checkCollision()');
		console.log(entA.name+":"+entB.name);
		return GooPX[entA.colliderComponent.collider.type+"_"+entB.colliderComponent.collider.type+"Support"](entA, entB);
	};
	GooPX.BoxCollider = function(){};
	GooPX.BoxCollider.pool = [];
	GooPX.BoxCollider.create = function(x, y, z){
		console.log('GooPX.BoxCollider.create()');
		var collider = (GooPX.BoxCollider.pool.length === 0) ? new GooPX.BoxCollider() : GooPX.BoxCollider.pool.shift();
		collider.type = 'Box';
		collider.extents = collider.extents || new goo.Vector3();
		collider.extents.setDirect(x, y, z);
		return collider;
	};
	GooPX.BoxCollider.prototype.destroy = function(){
		console.log('GooPX.BoxCollider.prototype.destroy');
		this.extents.setDirect(0, 0, 0);
		GooPX.BoxCollider.pool.push(this);
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
	
	GooPX.CylinderCollider = function(){};
	GooPX.CylinderCollider.pool = [];
	GooPX.CylinderCollider.create = function(r, h){
		console.log('GooPX.CylinderCollider.create()');
		var collider = (GooPX.CylinderCollider.pool.length === 0) ? new GooPX.CylinderCollider() : GooPX.CylinderCollider.pool.shift();
		collider.type = 'Cylinder';
		collider.radius = r;
		collider.halfHeight = h;
		return collider;
	};
	GooPX.CylinderCollider.prototype.destroy = function(){
		console.log('GooPX.CylinderCollider.prototype.destroy');
		this.radius = 1.0;
		this.halfHeight = 0.5;
		GooPX.CylinderCollider.pool.push(this);
	};
	
	GooPX.ConeCollider = function(){};
	GooPX.ConeCollider.pool = [];
	GooPX.ConeCollider.create = function(r, h){
		console.log('GooPX.ConeCollider.create()');
		var collider = (GooPX.ConeCollider.pool.length === 0) ? new GooPX.ConeCollider() : GooPX.ConeCollider.pool.shift();
		collider.type = 'Cone';
		collider.radius = r;
		collider.height = h;
		return collider;
	};
	GooPX.ConeCollider.prototype.destroy = function(){
		console.log('GooPX.ConeCollider.prototype.destroy');
		this.radius = 1.0;
		this.height = 2.0;
		GooPX.ConeCollider.pool.push(this);
	};
	
	GooPX.CollisionData = function(bool, distance){
		this.bool = bool;
		this.distance = distance;
	};
	
	var global = global || window;
	window.GooPX = GooPX;
}(window));
