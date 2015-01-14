(function(window, document, undefined){
	
	var invBodyTransform = new goo.Transform();
	var gooTrans = new goo.Transform();
	var gooTrans2 = new goo.Transform();
	var tmpVec = new goo.Vector3();
	var tmpQuat = new goo.Quaternion();
	var pVec;
	var pQuat;
	
	var GooPX = {};
	
	GooPX.CannonSystem = function(settings){
		goo.System.call(this, 'CannonSystem', ['RigidbodyComponent', 'TransformComponent']);
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
		
		pVec = new CANNON.Vec3();
		pQuat = new CANNON.Quaternion();
		offset = new CANNON.Vec3();
  	};
	GooPX.CannonSystem.prototype = Object.create(goo.System.prototype);
	GooPX.CannonSystem.prototype.constructor = GooPX.CannonSystem;
	
	GooPX.CannonSystem.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	console.log(ent);
	    	var world = this.world;
	    	
	    	if(undefined === ent.rigidbodyComponent){console.log('No RigidbodyComponent!');return;}
		
		var rbc = ent.rigidbodyComponent;
		GooPX.CannonSystem.addShapesToBody(ent);
		console.log(rbc.body.shapes.length);
		if(!rbc.body.shapes.length){
			console.warn('Could not add cannon shapes to body!');
			ent.clearComponent('CannonRigidbodyComponent');
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
		if(undefined !== ent.rigidbodyComponent){
			this.world.remove(ent.rigidbodyComponent.body);
			delete ent.rigidbodyComponent.shape;
			ent.clearComponent('RigidbodyComponent');
			console.log('removed rbc');
		}
		if(undefined !== ent.colliderComponent){
			delete ent.colliderComponent.shape;
			ent.clearComponent('ColliderComponent');
			console.log('removed cc');
		}
		for(var i = ent.transformComponent.children.length; i--;){
			GooPX.CannonSystem.prototype.deleted(ent.transformComponent.children[i].entity);
			console.log('____');
		}
		console.log('------');
	};
	
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
			tmpQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			ent.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
			
			var position = rbc.body.position;
			// Add center of mass offset
			cannonQuat.vmult(rbc.centerOfMassOffset, tmpVec);
			position.vadd(tmpVec, tmpVec);
			
			ent.transformComponent.setTranslation(tmpVec.x, tmpVec.y, tmpVec.z);

			ent.transformComponent.updateTransform();
			ent.transformComponent.updateWorldTransform();
			ent.transformComponent._dirty = true;
		}
	};

	GooPX.CannonSystem.generateCollider = function(ent, isTrigger){
		console.log('GooPX.generateCollider()');
		console.log(ent);
		isTrigger = isTrigger === undefined ? false : isTrigger;
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
					md.height * scl.z,
					10
				);
			}
			else if(md instanceof goo.Cone){
				console.log('Goo Shape is a Cone');
				shape = new CANNON.Cylinder(
					0.01,
					scl.x * md.radius,
					md.height * scl.z,
					10
				);
				shape._offset = new goo.Vector3(0, 0, -md.height * scl.z * 0.5);
			}
			else if(md instanceof goo.Disk){
				console.log('Goo Shape is a Disk');
				shape = 'new GooPX.DiskCollider()';
			}
			// add one for capsule???
			else{
				//console.log('Goo Shape is a StaticMesh');
				//shape = 'new GooPX.StaticMeshCollider()';	
			}
			console.log('MeshData:');
			console.log(ent.meshDataComponent.meshData);
		}
		else{
			for(var i = ent.transformComponent.children.length; i--;){
				var child = ent.transformComponent.children[i].entity;
				console.log('Creating collider for sub child:');
				console.log(child);
				var childShape = GooPX.CannonSystem.generateCollider(child, isTrigger);
				if(childShape !== undefined){
					child.setComponent(new GooPX.ColliderComponent({shape:childShape, isTrigger:isTrigger}));
				}
				console.log('______');
			}
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
		if(undefined !== collider){
			if(true === collider.isTrigger) {
				collider.shape.collisionResponse = false;
			}
			body.addShape(collider.shape, collider._offset);
		}
		if(ent.transformComponent.children.length > 0){
			var bodyTransform = ent.transformComponent.worldTransform;
			invBodyTransform.copy(bodyTransform);
			invBodyTransform.invert(invBodyTransform);
			var cmOffset = rbc.centerOfMassOffset;

			ent.traverse(function (childEntity) {
				if(ent !== childEntity){
					var collider = childEntity.colliderComponent;
					if (undefined !== collider) {
						// Look at the world transform and then get the transform relative to the root entity. This is needed for compounds with more than one level of recursion
						gooTrans.copy(childEntity.transformComponent.worldTransform);
						goo.Transform.combine(invBodyTransform, gooTrans, gooTrans2);
						gooTrans2.update();
						gooTrans2.updateNormalMatrix();
	
						var trans = gooTrans2.translation;
						if(collider._offset){
							gooTrans2.applyForwardVector(collider._offset, tmpVec);
							trans.addVector(tmpVec);
							rbc.centerOfMassOffset.subVector(tmpVec);
						}
						var rot = gooTrans2.rotation;
						pVec.set(trans.x, trans.y, trans.z);
						var q = tmpQuat;
						q.fromRotationMatrix(rot);
						pQuat.set(q.x, q.y, q.z, q.w);
	
						// Subtract center of mass offset
						pVec.vadd(cmOffset, pVec);
	
						if(true === collider.isTrigger) {
							collider.shape.collisionResponse = false;
						}
						
						// Add the shape
						body.addShape(collider.shape, pVec, pQuat);
					}
					
				}
			});
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
	
	GooPX.SphereColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		this.radius = settings === undefined || settings.radius === undefined ? 1.0 : settings.radius;
		this.isTrigger = settings === undefined || settings.isTrigger === undefined ? false : settings.isTrigger;
		this.shape = settings === undefined || settings.shape === undefined ? new CANNON.Sphere(this.radius) : settings.shape;
	}
	GooPX.SphereColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.SphereColliderComponent.prototype.constructor = GooPX.SphereColliderComponent;
	
	GooPX.BoxColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		this.extents = settings === undefined || settings.extents === undefined ? new goo.Vector3(0.5,0.5,0.5) : settings.extents;
		this.isTrigger = settings === undefined || settings.isTrigger === undefined ? false : settings.isTrigger;
		this.shape = settings === undefined || settings.shape === undefined ? new CANNON.Box(new CANNON.Vec3(this.extents.x, this.extents.y, this.extents.z)) : settings.shape;
	}
	GooPX.BoxColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.BoxColliderComponent.prototype.constructor = GooPX.BoxColliderComponent;
	
	GooPX.CylinderColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		this.radiusTop = settings === undefined || settings.radiusTop === undefined ? 1.0 : settings.radiusTop;
		this.radiusBottom = settings === undefined || settings.radiusBottom === undefined ? 1.0 : settings.radiusBottom;
		this.height = settings === undefined || settings.height === undefined ? 1.0 : settings.height;
		this.isTrigger = settings === undefined || settings.isTrigger === undefined ? false : settings.isTrigger;
		this.shape = settings === undefined || settings.shape === undefined ? new CANNON.Cylinder(this.radiusTop, this.radiusBottom, this.height, 32) : settings.shape;
	}
	GooPX.CylinderColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.CylinderColliderComponent.prototype.constructor = GooPX.CylinderColliderComponent;
	
	GooPX.ConeColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		this.radiusTop = settings === undefined || settings.radiusTop === undefined ? 0.0 : settings.radiusTop;
		this.radiusBottom = settings === undefined || settings.radiusBottom === undefined ? 1.0 : settings.radiusBottom;
		this.height = settings === undefined || settings.height === undefined ? 2.0 : settings.height;
		this.isTrigger = settings === undefined || settings.isTrigger === undefined ? false : settings.isTrigger;
		this.shape = settings === undefined || settings.shape === undefined ? new CANNON.Cylinder(this.radiusTop, this.radiusBottom, this.height, 32) : settings.shape;
		this._offset = new goo.Vector3(0, 0, this.height*0.5);
	}
	GooPX.ConeColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.ConeColliderComponent.prototype.constructor = GooPX.ConeColliderComponent;
	
	GooPX.ColliderComponent = function(settings){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
		
	};
	GooPX.ColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.ColliderComponent.prototype.constructor = GooPX.ColliderComponent;
	
	var global = global || window;
	window.GooPX = GooPX;
}(window, document));
