(function(window, document){
  var AmmoUtil = {};
  var pvec,ptrans,pquat;
  var quat, goo, gooVec;

  AmmoUtil.createAmmoSystem = function(args, ctx, _goo){
  	goo = goo || _goo;
	function AmmoSystem(){
		this.priority = Infinity;
		args = args || {};
		goo.System.call(this, 'AmmoSystem', ['RigidBodyComponent', 'ColliderComponent', 'TransformComponent']);
		this.fixedTime = 1/(args.stepFrequency || 60);
		this.maxSubSteps = args.maxSubSteps || 10;
		this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
		this.overlappingPairCache = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
		
		pvec = pvec || new Ammo.btVector3(0,0,0);
		pvec = this.ammoWorld.getGravity();
		args.gravity = args.gravity || [0, -9.8, 0];
		pvec.setValue(args.gravity[0], args.gravity[1], args.gravity[2]);
		this.ammoWorld.setGravity(pvec);
	}
	AmmoSystem.prototype = Object.create(goo.System.prototype);
	AmmoSystem.constructor = AmmoSystem;
	
	AmmoSystem.prototype.inserted = function(ent){
		if (ent.rigidBodyComponent && ent.colliderComponent) {
			this.ammoWorld.addRigidBody(ent.rigidBodyComponent.body);
		}
	};
	
	AmmoSystem.prototype.process = function(entities, tpf) {
		this.ammoWorld.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
		for(var i = 0, ilen = entities.length; i < ilen; i++){
			if(entities[i].rigidBodyComponent.body.getMotionState()){
				entities[i].rigidBodyComponent.updateVisuals(entities[i]);
			}
		}
	};
	AmmoSystem.prototype.deleted = function(ent) {
		if (ent.rigidbodyComponent) {
			this.ammoWorld.removeRigidBody(ent.rigidBodyComponent.body);
		}
	};
	
	AmmoSystem.prototype.setGravity = function(x, y, z){
		var gravity = this.ammoWorld.getGravity();
		(typeof(x) === 'number') ? gravity.setValue(x, y, z) : gravity.setValue(x[0], x[1], x[2]);
		this.ammoWorld.setGravity(gravity);
		delete gravity;
	}
	
	var ammoSystem = new AmmoSystem();
	return ammoSystem;
  }
  AmmoUtil.destroyAmmoSystem = function(args, ctx, _goo){
  	goo = goo || _goo;
  	var ammoSystem = ctx.world.getSystem("AmmoSystem");
  	if(ammoSystem){
  		for(var i = 0, ilen = ammoSystem._activeEntities.length; i < ilen; i++){
  			if(ammoSystem._activeEntities[i].rigidBodyComponent){
  				ammoSystem._activeEntities[i].clearComponent("RigidBodyComponent");
  				ammoSystem._activeEntities[i].clearComponent("ColliderComponent");
  			}	
  		}
  		
  		Ammo.destroy(ammoSystem.ammoWorld);
  		Ammo.destroy(ammoSystem.solver);
  		Ammo.destroy(ammoSystem.overlappingPairCache);
  		Ammo.destroy(ammoSystem.dispatcher);
  		Ammo.destroy(ammoSystem.collisionConfiguration);

  		var index = ctx.world._systems.indexOf(ammoSystem);
  		if(index !== -1){
  			ctx.world._systems.splice(index, 1);
  		}
  	}
  }
  
  AmmoUtil.getColliderFromGooShape = function(ent, _goo){
  	goo = goo || _goo;
  	var col = null;
  	var scl = [
  		ent.transformComponent.transform.scale[0],
  		ent.transformComponent.transform.scale[1],
  		ent.transformComponent.transform.scale[2]];
  		
  	function setScale(e1){
  		console.log(ent.id+":"+e1.id);
  		console.log(ent === e1);
		if(e1 !== ent){
			scl[0] *= e1.transformComponent.transform.scale[0];
			scl[1] *= e1.transformComponent.transform.scale[1];
			scl[2] *= e1.transformComponent.transform.scale[2];
		}
	}
	//fix scaleing issues for all parents
	ent.traverseUp(setScale);
  	//var scl = [Math.abs(pTrans.scale[0] / entScl[0]), Math.abs(pTrans.scale[1] / entScl[1]), Math.abs(pTrans.scale[2] / entScl[2])];
  	if(ent.meshDataComponent && ent.meshDataComponent.meshData){
  		var md = ent.meshDataComponent.meshData;
  		if(md instanceof goo.Box){
			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl[0], md.yExtent * scl[1], md.zExtent * scl[2]]}, goo);
  		}else if(md instanceof goo.Sphere){
  			col = AmmoUtil.createSphereColliderComponent({radius:md.radius * scl[0]}, goo);
  		}else if(md instanceof goo.Quad){
  			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl[0], md.yExtent * scl[1], 0.01]}, goo);
  		}else if(md instanceof goo.Cylinder){
  			col = AmmoUtil.createCylinderZColliderComponent({radius:md.radius * scl[0], halfHeight:scl[2] * 0.5}, goo);
  		}else if(md instanceof goo.Cone){
  			var offset = new goo.Vector3(0, 0, -md.height * scl[2] * 0.5);
  			col = AmmoUtil.createConeZColliderComponent({radius:md.radius * scl[0], height:md.height * scl[2]}, goo);
  			col.offset = offset;
  		}else{
  			// mesh
	  		col = AmmoUtil.createMeshColliderComponent({scale:scl, entity:ent}, goo);
  		}
  	}
  	else{
  		col = AmmoUtil.createCompoundColliderComponent({entity:ent}, goo);
  	}
  	return col;
  };
  
  AmmoUtil.createRigidBodyComponent = function(args, ctx, _goo){
  	goo = goo || _goo;
	function RigidBodyComponent(){
		args = args || {};
  		this.type = 'RigidBodyComponent';
  		this.mass = args.mass || 0.0;
  		var collider = ctx.entity.getComponent("ColliderComponent");
  		if(undefined === collider){
  			collider = args.collider || AmmoUtil.getColliderFromGooShape(ctx.entity, goo);
  			if(null === collider){
  				console.error("Could not identify collider info!");
  				return;
  			}
  			ctx.entity.setComponent(collider);
  		}
  		var startTransform = new Ammo.btTransform();
  		startTransform.setIdentity();
		var gooPos = ctx.entity.transformComponent.transform.translation;
		if(collider.offset){
			gooVec = gooVec || new goo.Vector3();
			gooVec.copy(collider.offset);
			ctx.entity.transformComponent.transform.applyForwardVector(collider.offset, gooVec);
			gooPos.subv(gooVec);
		}
		var gooRot = ctx.entity.transformComponent.transform.rotation;
		var localInertia = new Ammo.btVector3(0, 0, 0);
		if(this.mass !== 0){
			collider.shape.calculateLocalInertia(this.mass, localInertia);
		}
		startTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		quat = quat || new goo.Quaternion();
		quat.fromRotationMatrix(gooRot);
		startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		var myMotionState = new Ammo.btDefaultMotionState(startTransform);
		var rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, myMotionState, collider.shape, localInertia);
		this.body = new Ammo.btRigidBody(rbInfo);
  	}
  	RigidBodyComponent.prototype = Object.create(goo.Component.prototype);
  	RigidBodyComponent.constructor = RigidBodyComponent;

  	RigidBodyComponent.prototype.updateVisuals = function(ent){
 		var tc = ent.transformComponent;
  		var pos = tc.transform.translation;
  		var rot = tc.transform.rotation;
  		var col = ent.colliderComponent;
  	
  		ptrans = ptrans || new Ammo.btTransform();
 		pquat = pquat || new Ammo.btQuaternion();
 		pvec = pvec || new Ammo.btVector3();
 		quat = quat || new goo.Quaternion();
 		gooVec = gooVec || new goo.Vector3();
 		
  		this.body.getMotionState().getWorldTransform(ptrans);
  		ptrans.getBasis().getRotation(pquat);
		quat.setd(pquat.x(), pquat.y(), pquat.z(), pquat.w());
		quat.toRotationMatrix(rot);
		pvec = ptrans.getOrigin();
		pos.setd(pvec.x(), pvec.y(), pvec.z());
		if(col.offset){
			gooVec.copy(col.offset);
			rot.applyPost(gooVec);
			pos.addv(gooVec);
		}
		tc.setUpdated();
  	};
  	
  	var rigidBody = new RigidBodyComponent;
  	return rigidBody;
  	
  }
  AmmoUtil.createBoxColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function BoxColliderComponent(){
  		args = args || {};
  		args.halfExtents = args.halfExtents || [1,1,1];
  		this.type = 'ColliderComponent';
  		pvec = pvec || new Ammo.btVector3();
  		pvec.setValue(args.halfExtents[0], args.halfExtents[1], args.halfExtents[2]);
  		this.shape = new Ammo.btBoxShape(pvec);
  	}
  	BoxColliderComponent.prototype = Object.create(goo.Component.prototype);
  	BoxColliderComponent.constructor = BoxColliderComponent;
  	
  	var shape = new BoxColliderComponent();
  	return shape;
  }
  AmmoUtil.createSphereColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function SphereColliderComponent(){
  		args = args || {};
  		args.radius = args.radius || 1;
  		this.type = 'ColliderComponent';
  		this.shape = new Ammo.btSphereShape(args.radius);
  	}
  	SphereColliderComponent.prototype = Object.create(goo.Component.prototype);
  	SphereColliderComponent.constructor = SphereColliderComponent;
  	var shape = new SphereColliderComponent();
  	return shape;
  };
  AmmoUtil.createConeZColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function ConeZColliderComponent(){
  		args = args || {};
  		args.radius = args.radius || 1.0;
  		args.height = args.height || 1.0;
  		this.type = 'ColliderComponent';
  		this.shape = new Ammo.btConeShapeZ(args.radius, args.height);
  	}
  	ConeZColliderComponent.prototype = Object.create(goo.Component.prototype);
  	ConeZColliderComponent.constructor = ConeZColliderComponent;
  	
  	var shape = new ConeZColliderComponent();
  	return shape;
  };
  AmmoUtil.createCylinderZColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function CylinderZColliderComponent(){
  		args = args || {};
  		args.radius = args.radius || 1.0;
  		args.halfHeight = args.halfHeight || 1.0;
  		this.type = 'ColliderComponent';
  		pvec = pvec || new Ammo.btVector3();
  		pvec.setValue(args.radius, args.radius, args.halfHeight);
  		this.shape = new Ammo.btCylinderShapeZ(pvec);
  	}
  	CylinderZColliderComponent.prototype = Object.create(goo.Component.prototype);
  	CylinderZColliderComponent.constructor = CylinderZColliderComponent;
  	
  	var shape = new CylinderZColliderComponent();
  	return shape;
  };
  AmmoUtil.createCylinderXColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function CylinderXColliderComponent(){
  		args = args || {};
  		args.radius = args.radius || 1.0;
  		args.halfHeight = args.halfHeight || 1.0;
  		this.type = 'ColliderComponent';
  		pvec = pvec || new Ammo.btVector3();
  		pvec.setValue(args.halfHeight, args.radius, args.radius);
  		this.shape = new Ammo.btCylinderShapeX(pvec);
  	}
  	CylinderXColliderComponent.prototype = Object.create(goo.Component.prototype);
  	CylinderXColliderComponent.constructor = CylinderXColliderComponent;
  	
  	var shape = new CylinderXColliderComponent();
  	return shape;
  };
  AmmoUtil.createCylinderYColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	function CylinderYColliderComponent(){
  		args = args || {};
  		args.radius = args.radius || 1.0;
  		args.halfHeight = args.halfHeight || 1.0;
  		this.type = 'ColliderComponent';
  		pvec = pvec || new Ammo.btVector3();
  		pvec.setValue(args.radius, args.halfHeight, args.radius);
  		this.shape = new Ammo.btCylinderShape(pvec);
  	}
  	CylinderYColliderComponent.prototype = Object.create(goo.Component.prototype);
  	CylinderYColliderComponent.constructor = CylinderYColliderComponent;
  	
  	var shape = new CylinderYColliderComponent();
  	return shape;
  };
  AmmoUtil.createMeshColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	
  	function MeshColliderComponent() {
  		this.type = 'ColliderComponent';
  		args.scale = args.scale || args.entity.transformComponent.transform.scale;
		//scale = scale || [1,1,1];
		var floatByteSize = 4;
		var use32bitIndices = true;
		var intByteSize = use32bitIndices ? 4 : 2;
		var intType = use32bitIndices ? "i32" : "i16";
		var meshData = args.entity.meshDataComponent.meshData;

		var vertices = meshData.dataViews.POSITION;
		var vertexBuffer = Ammo.allocate( floatByteSize * vertices.length, "float", Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = vertices.length; i < il; i ++ ) {
			Ammo.setValue( vertexBuffer + i * floatByteSize, args.scale[i%3] * vertices[ i ], 'float' );
		}
		var indices = meshData.indexData.data;
		var indexBuffer = Ammo.allocate( intByteSize * indices.length, intType, Ammo.ALLOC_NORMAL );
		for ( var i = 0, il = indices.length; i < il; i ++ ) {
			Ammo.setValue( indexBuffer + i * intByteSize, indices[ i ], intType );
		}

		var iMesh = new Ammo.btIndexedMesh();
		iMesh.set_m_numTriangles( meshData.indexCount / 3 );
		iMesh.set_m_triangleIndexBase( indexBuffer );
		iMesh.set_m_triangleIndexStride( intByteSize * 3 );
		iMesh.set_m_numVertices( meshData.vertexCount );
		iMesh.set_m_vertexBase( vertexBuffer );
		iMesh.set_m_vertexStride( floatByteSize * 3 );

		var triangleIndexVertexArray = new Ammo.btTriangleIndexVertexArray();
		triangleIndexVertexArray.addIndexedMesh( iMesh, 2);
		// bvh = Bounding Volume Hierarchy
		this.shape = new Ammo.btBvhTriangleMeshShape( triangleIndexVertexArray, true, true );
	};
	MeshColliderComponent.prototype = Object.create(goo.Component.prototype);
  	MeshColliderComponent.constructor = MeshColliderComponent;
	var shape = new MeshColliderComponent();
	return shape;
  };
  AmmoUtil.createCompoundColliderComponent = function(args, _goo){
  	goo = goo || _goo;
  	
  	function CompoundColliderComponent() {
	  	this.shape = new Ammo.btCompoundShape(true);
	  	this.type = 'ColliderComponent';
	  	var children = args.entity.transformComponent.children;
		for (var i = 0, ilen = children.length; i < ilen; i++) {
			var child = children[i].entity;
			var childCol = AmmoUtil.getColliderFromGooShape(child, goo);
			if(childCol !== null){
				var localTrans = new Ammo.btTransform();
				localTrans.setIdentity();
				var gooPos = child.transformComponent.worldTransform.translation;
				gooPos.subv(args.ent.transformComponent.worldTransform.translation);
				if(childCol.offset){
					gooVec = gooVec || new goo.Vector3();
					gooVec.copy(childCol.offset);
					child.transformComponent.transform.applyForwardVector(childCol.offset, gooVec);
					gooPos.subv(gooVec);
				}
				localTrans.setOrigin(new Ammo.btVector3(gooPos[0], gooPos[1], gooPos[2]));
				var gooRot = child.transformComponent.transform.rotation;
				quat = quat || new goo.Quaternion();
				quat.fromRotationMatrix(gooRot);
				localTrans.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
				this.shape.addChildShape(localTrans, childCol.shape);
			}
		}
  	}
	CompoundColliderComponent.prototype = Object.create(goo.Component.prototype);
  	CompoundColliderComponent.constructor = CompoundColliderComponent;
	var shape = new CompoundColliderComponent();
	return shape;
  }
  AmmoUtil.setLinearVelocity = function(body, vec3){
  	pvec = pvec || new Ammo.btVector3();
  	
  	pvec.setValue(vec3.x, vec3.y, vec3.z);
	body.setLinearVelocity(pvec);
  };
  AmmoUtil.setRotation = function(body, quat){
 	ptrans = ptrans || new Ammo.btTransform();
 	pquat = pquat || new Ammo.btQuaternion();
 	
	ptrans = body.getCenterOfMassTransform();
	pquat = ptrans.getRotation();
	pquat.setValue(quat.x, quat.y, quat.z, quat.w);
	ptrans.setRotation(pquat);
	body.setCenterOfMassTransform(ptrans);
  };
  
  var global = global || window;
  global.AmmoUtil = AmmoUtil;
}(window, document, undefined));
