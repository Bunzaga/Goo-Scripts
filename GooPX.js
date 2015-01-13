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
	
	GooPX.System.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	console.log(ent);
	    	if(undefined === ent.rigidbodyComponent){console.log('No RigidbodyComponent!');return;}
		// do something with RigidbodyComponent or entity here
		if(undefined === ent.colliderComponent){
			console.log('The entity does not have a ColliderComponent(adding one),');
			ent.setComponent(new GooPX.ColliderComponent(GooPX.generateCollider(ent)));
		}
		else{
			console.log('The entity already has a ColliderComponent,');
			if(undefined === ent.colliderComponent.collider){
				console.log('No collider in the ColliderComponent, creating one.');
				ent.colliderComponent.collider = GooPX.generateCollider(ent);
			}
		}
		console.log('-----------');
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
  
	GooPX.RigidbodyComponent = function(){
		goo.Component.call(this, arguments);
		this.type = 'RigidbodyComponent';
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.prototype.constructor = GooPX.RigidbodyComponent;
	
	GooPX.generateCollider = function(ent){
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
		console.log('-----------');
		return shape;
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
