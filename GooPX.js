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
		this._lastTime = performance.now() * 0.001;
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
			if(undefined === ent.colliderComponent.collider){
				console.log('No collider in the ColliderComponent, creating one.');
				ent.colliderComponent.collider = GooPX.CannonSystem.generateCollider(ent);
			}
		}
		
		var rbc = ent.rigidbodyComponent;
		var trans = ent.transformComponent.transform;
		rbc.setTranslation(trans.translation);
		rbc.setVelocity(rbc.velocity);
		rbc.setRotation(trans.rotation);
		
		world.add(body);
		
		// var c = entity.cannonDistanceJointComponent;
		// if (c) {
		//	world.addConstraint(c.createConstraint(entity));
		//}
		console.log('-----------');
	};
	var tmpVec = new goo.Vector3();
	var tmpQuat = new goo.Quaternion();
	GooPX.CannonSystem.prototype.process = function(ents, tpf){
		var world = this.world;
		
		// Step the world forward in time
		var maxSubSteps = this.maxSubSteps;
		if (maxSubSteps > 0){
			var fixedTimeStep = 1 / this.stepFrequency;
			//var now = performance.now() * 0.001;
			//var dt = now - this._lastTime;
			//this._lastTime = now;
			world.step(fixedTimeStep, tpf, maxSubSteps);
		} else {
			world.step(tpf);
			//world.step(fixedTimeStep);
		}
		
		// Update positions of entities from the physics data
		for (var i = ents.length; i--;) {
			var ent = ents[i];
			var cannonComponent = ent.cannonComponent;
			cannonComponent.body.computeAABB(); // Quick fix
			var cannonQuat = cannonComponent.body.quaternion;
			var position = cannonComponent.body.position;

			// Add center of mass offset
			cannonQuat.vmult(cannonComponent.centerOfMassOffset, tmpVec);
			position.vadd(tmpVec, tmpVec);
			ent.transformComponent.setTranslation(tmpVec.x, tmpVec.y, tmpVec.z);

			tmpQuat.set(cannonQuat.x, cannonQuat.y, cannonQuat.z, cannonQuat.w);
			ent.transformComponent.transform.rotation.copyQuaternion(tmpQuat);
			ent.transformComponent.setUpdated();
		}
	};
	
	GooPX.CannonSystem.generateCollider = function(ent){
		console.log('GooPX.generateCollider()');
		console.log(ent);
		
		var shape = undefined;
		if(ent.meshDataComponent && ent.meshDataComponent.meshData){
			/*scl.copy(ent.transformComponent.worldTransform.scale);
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
			}*/
			console.log('MeshData:');
			console.log(ent.meshDataComponent.meshData);
		}
		else{
			console.log('This is a parent entity or no MeshData');
			//shape = 'new GooPX.CompoundCollider()';
		}
		
		if (!body.shapes.length) {
			ent.clearComponent('CannonRigidbodyComponent');
			continue;
		}
		
		console.log('-----------');
		return shape;
	};
  
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
		this._initialVelocity = new goo.Vector3().copy(settings === undefined || settings.velocity === undefined ? goo.Vector3.ZERO : settings.velocity);
		this.centerOfMassOffset = new goo.Vector3();
		
		this.body = new CANNON.Body({
			mass: this.mass
		});
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.prototype.constructor = GooPX.RigidbodyComponent;
	
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
	
	GooPX.ColliderComponent = function(){
		goo.Component.call(this, arguments);
		this.type = 'ColliderComponent';
	};
	GooPX.ColliderComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.ColliderComponent.prototype.constructor = GooPX.ColliderComponent;
	
	var global = global || window;
	window.GooPX = GooPX;
}(window, document));
