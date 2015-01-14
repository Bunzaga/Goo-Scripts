(function(window, document, undefined){
	
	var invBodyTransform = new goo.Transform();
	var gooTrans = new goo.Transform();
	var gooTrans2 = new goo.Transform();
	var tmpVec = new goo.Vector3();
	var tmpQuat = new goo.Quaternion();
	
	var offset;
	var orientation;
	
	var GooPX = {};
	
	GooPX.CannonSystem = function(settings){
		goo.System.call(this, 'CannonSystem', ['RigidbodyComponent', 'ColliderComponent']);
		this.priority = 1;
		this.gravity = settings === undefined || settings.gravity === undefined ? new goo.Vector3(0, -9.806, 0) : settings.gravity;
		this.stepFrequency = settings === undefined || settings.stepFrequency === undefined ? 60 : settings.stepFrequency;
		this.broadphase = settings === undefined || settings.broadphase === undefined ? 'naive' : settings.broadphase;
		this.maxSubSteps = settings === undefined || settings.maxSubSteps === undefined ? 0 : settings.maxSubSteps;
    
		var world = this.world = new CANNON.World();
		world.gravity.x = this.gravity.x;
		world.gravity.y = this.gravity.y;
		world.gravity.z = this.gravity.z;
		this.setBroadphaseAlgorithm(this.broadphase);
		this._accumulated = 0.0;
		
		offset = new CANNON.Vec3();
		orientation = new CANNON.Quaternion();
  	};
	GooPX.CannonSystem.prototype = Object.create(goo.System.prototype);
	GooPX.CannonSystem.prototype.constructor = GooPX.CannonSystem;
	
	GooPX.CannonSystem.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	console.log(ent);
	    	var world = this.world;
	    	
	    	if(undefined === ent.rigidbodyComponent){console.log('No RigidbodyComponent!');return;}
		// do something with RigidbodyComponent or entity here
		if(undefined === ent.colliderComponent){
			console.log('The entity does not have a ColliderComponent(adding one),');
			ent.setComponent(new GooPX.ColliderComponent(GooPX.CannonSystem.generateCollider(ent)));
		}
		else{
			console.log('The entity already has a ColliderComponent,');
			if(undefined === ent.colliderComponent.shape){
				console.log('No collider in the ColliderComponent, creating one.');
				ent.colliderComponent.shape = GooPX.CannonSystem.generateCollider(ent);
			}
		}
		
		if(undefined === ent.colliderComponent.shape){
			console.warn('No cannon shape available!');
			ent.clearComponent('ColliderComponent');
			return;
		}
		
		var rbc = ent.rigidbodyComponent;
		GooPX.CannonSystem.addShapesToBody(ent);
		console.log(rbc.body.shapes.length);
		if(!rbc.body.shapes.length){
			console.warn('Could not add cannon shapes to body!');
			entity.clearComponent('CannonRigidbodyComponent');
			return;
		}
		var trans = ent.transformComponent.transform;
		rbc.setTranslation(trans.translation);
		rbc.setRotation(trans.rotation);
		rbc.setVelocity(rbc.velocity);
		
		world.add(rbc.body);
		
		// var c = entity.cannonDistanceJointComponent;
		// if (c) {
		//	world.addConstraint(c.createConstraint(entity));
		//}
		console.log('-----------');
	};
	
	GooPX.CannonSystem.prototype.deleted = function(ent){
		console.log('GooPX.System.deleted()');
		if(ent.rigidbodyComponent){
			this.world.remove(ent.rigidbodyComponent.body);
			ent.clearComponent('RigidbodyComponent');
		}
		if(ent.colliderComponent){
			ent.clearComponent('ColliderComponent');
		}
		console.log('------');
	}
	
	GooPX.CannonSystem.prototype.process = function(ents, tpf){
		var world = this.world;
		
		// Step the world forward in time
		var fixedTimeStep = 1 / this.stepFrequency;
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps > 0){
			world.step(fixedTimeStep, tpf, maxSubSteps);
		} else {
			world.step(tpf);
		}
		
		// Update positions of entities from the physics data
		for (var i = ents.length; i--;) {
			var ent = ents[i];
			var rbc = ent.rigidbodyComponent;
			rbc.body.computeAABB(); // Quick fix
			var cannonQuat = rbc.body.quaternion;
			var position = rbc.body.position;

			// Add center of mass offset
			cannonQuat.vmult(rbc.centerOfMassOffset, tmpVec);
			position.vadd(tmpVec, tmpVec);
			ent.transformComponent.setTranslation(tmpVec.x, tmpVec.y, tmpVec.z);

			tmpQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			ent.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
			ent.transformComponent.updateTransform();
			ent.transformComponent.updateWorldTransform();
			ent.transformComponent._dirty = true;
		}
	};
	
	GooPX.CannonSystem.generateCollider = function(ent){
		console.log('GooPX.generateCollider()');
		console.log(ent);
		
		var shape = undefined;
		if(ent.meshDataComponent && ent.meshDataComponent.meshData){
			var scl = tmpVec;
			scl.copy(ent.transformComponent.worldTransform.scale);
			var md = ent.meshDataComponent.meshData;
			
			if(md instanceof goo.Sphere){
				console.log('Goo Shape is a Sphere');
				console.log('The radius is '+(md.radius * Math.max(scl.x, scl.y, scl.z)));
				shape = new CANNON.Sphere(md.radius * Math.max(scl.x, scl.y, scl.z));
			}
			else if(md instanceof goo.Box){
				console.log('Goo Shape is a Box');
				offset.set(md.xExtent * scl.x, md.yExtent * scl.y, md.zExtent * scl.z);
				shape = new CANNON.Box(offset);
			}
			else if(md instanceof goo.Quad){
				console.log('Goo Shape is a Quad');
				shape = 'new GooPX.QuadCollider()';
			}
			else if(md instanceof goo.Cylinder){
				console.log('Goo Shape is a Cylinder');
				shape = new CANNON.Cylinder(
					scl.x * md.radius,
					scl.x * md.radius,
					md.height * 0.5,
					10
				);
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
		console.log('-----------');
		return shape;
	};
	
	GooPX.CannonSystem.addShapesToBody = function(ent){
		console.log('GooPX.CannonSystem.addShapesToBody()');
		console.log(ent);
		var rbc = ent.rigidbodyComponent;
		var body = rbc.body;
		var collider = ent.colliderComponent;
		if(undefined === collider) {
			// Needed for getting the Rigidbody-local transform of each collider
			var bodyTransform = ent.transformComponent.worldTransform;
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);

			var cmOffset = rbc.centerOfMassOffset;

			ent.traverse(function (childEntity) {
				var collider = childEntity.colliderComponent;
				if (undefined !== collider) {

					// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
					gooTrans.copy(childEntity.transformComponent.worldTransform);
					//var gooTrans2 = new Transform();
					goo.Transform.combine(invBodyTransform, gooTrans, gooTrans2);
					gooTrans2.update();

					var trans = gooTrans2.translation;
					var rot = gooTrans2.rotation;
					offset.set(trans.x, trans.y, trans.z);
					var q = tmpQuat;
					q.fromRotationMatrix(rot);
					orientation.set(q.x, q.y, q.z, q.w);

					// Subtract center of mass offset
					offset.vadd(cmOffset, offset);

					if(true === collider.isTrigger) {
						collider.shape.collisionResponse = false;
					}
					
					// Add the shape
					body.addShape(collider.shape, offset, orientation);
				}
			});

		} else {

			// Entity has a collider on the root
			// Create a simple shape
			body.addShape(collider.shape);
		}
		console.log('--------');
	}

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
  
	GooPX.RigidbodyComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'RigidbodyComponent';
		this.mass = settings === undefined || settings.mass === undefined ? 1 : settings.mass;
		this.velocity = new goo.Vector3().copy(settings === undefined || settings.velocity === undefined ? goo.Vector3.ZERO : settings.velocity);
		this.centerOfMassOffset = new goo.Vector3();
		
		this.body = new CANNON.Body({
			mass: this.mass
		});
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.prototype.constructor = GooPX.RigidbodyComponent;
	
	GooPX.RigidbodyComponent.prototype.detached = function(ent){
		
	};
	
	GooPX.RigidbodyComponent.prototype.setForce = function(force){
		this.body.force.set(force.x, force.y, force.z);
	};
	GooPX.RigidbodyComponent.prototype.setVelocity = function(velocity){
		this.body.velocity.set(velocity.x, velocity.y, velocity.z);
	};
	GooPX.RigidbodyComponent.prototype.setTranslation = function(pos){
		this.body.position.set(pos.x, pos.y, pos.z);
	};
	GooPX.RigidbodyComponent.prototype.setRotation = function(rot){
		var q = tmpQuat;
		q.fromRotationMatrix(rot);
		this.body.quaternion.set(q.x, q.y, q.z, q.w);
	};
	GooPX.RigidbodyComponent.prototype.setAngularVelocity = function(angularVelocity){
		this.body.angularVelocity.set(angularVelocity.x, angularVelocity.y, angularVelocity.z);
	};
	
	GooPX.ColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		this.shape = settings === undefined ? undefined : settings.shape;
		this.isTrigger = settings === undefined || settings.isTrigger === undefined ? false : settings.isTrigger;
	};
	GooPX.ColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.ColliderComponent.prototype.constructor = GooPX.ColliderComponent;
	
	var global = global || window;
	window.GooPX = GooPX;
}(window, document));
