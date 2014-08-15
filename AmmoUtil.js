// need to import https://kripken.github.io/ammo.js/builds/ammo.small.js

(function(window, document){
var 	AmmoUtil = {};
var 	pvec, ptrans, pquat,
	quat, goo, gooVec;

AmmoUtil.setup = function(_goo){
	goo = _goo;
	pvec = new Ammo.btVector3();
	ptrans = new Ammo.btTransform();
	pquat = new Ammo.btQuaternion();
	quat = new goo.Quaternion();
	vec = new goo.Vector3();
	AmmoUtil.ready = true;
};
AmmoUtil.ready = false;

AmmoUtil.createAmmoSystem = function(args){
	function AmmoSystem(){
		this.priority = Infinity;
		args = args || {};
		args.gravity = args.gravity || [0, -9.8, 0];
		goo.System.call(this, 'AmmoSystem', ['RigidBodyComponent', 'ColliderComponent']);
		this.fixedTime = 1/(args.stepFrequency || 60);
		//this.accumulated = 0.0;
		this.maxSubSteps = args.maxSubSteps || 10;
		this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
		this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
		this.overlappingPairCache = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.ammoWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
	
		pvec = this.ammoWorld.getGravity();
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
		if (ent.rigidBodyComponent) {
			this.ammoWorld.removeRigidBody(ent.rigidBodyComponent.body);
			Ammo.destroy(ent.colliderComponent.shape);
			Ammo.destroy(ent.rigidBodyComponent.body);
			delete ent.colliderComponent.shape;
			delete ent.rigidBodyComponent.body;
			if(ent.colliderComponent){
				ent.clearComponent('ColliderComponent');
			}
			ent.clearComponent('RigidBodyComponent');
		}
	};
	
	AmmoSystem.prototype.setGravity = function(x, y, z){
		pvec = this.ammoWorld.getGravity();
		(typeof(x) === 'number') ? pvec.setValue(x, y, z) : gravity.setValue(x[0], x[1], x[2]);
		this.ammoWorld.setGravity(pvec);
	}
	
	var ammoSystem = new AmmoSystem();
	return ammoSystem;
  }
  AmmoUtil.destroyAmmoSystem = function(world, ammoSystem){
  	AmmoUtil.ready = false;
  	if(ammoSystem){
  		for(var i = 0, ilen = ammoSystem._activeEntities.length; i < ilen; i++){
  			if(ammoSystem._activeEntities[i].rigidBodyComponent){
  				ammoSystem.ammoWorld.removeRigidBody(ammoSystem._activeEntities[i].rigidBodyComponent.body);
  				Ammo.destroy(ammoSystem._activeEntities[i].colliderComponent.shape);
  				Ammo.destroy(ammoSystem._activeEntities[i].rigidBodyComponent.body);
  				delete ammoSystem._activeEntities[i].colliderComponent.shape;
  				delete ammoSystem._activeEntities[i].rigidBodyComponent.body;
  				ammoSystem._activeEntities[i].clearComponent("ColliderComponent");
  				ammoSystem._activeEntities[i].clearComponent("RigidBodyComponent");
  			}	
  		}
  		
  		Ammo.destroy(ammoSystem.ammoWorld);
  		Ammo.destroy(ammoSystem.solver);
  		Ammo.destroy(ammoSystem.overlappingPairCache);
  		Ammo.destroy(ammoSystem.dispatcher);
  		Ammo.destroy(ammoSystem.collisionConfiguration);
  		
  		delete ammoSystem.ammoWorld;
  		delete ammoSystem.solver;
  		delete ammoSystem.overlappingPairCache;
  		delete ammoSystem.dispatcher;
  		delete ammoSystem.collisionConfiguration;

  		var index = world._systems.indexOf(ammoSystem);
  		if(index !== -1){
  			world._systems.splice(index, 1);
  		}
  	}
  };
  
  AmmoUtil.getColliderFromGooShape = function(ent){
  	var col = null;
  	var scl = [
  		Math.abs(ent.transformComponent.transform.scale[0]),
  		Math.abs(ent.transformComponent.transform.scale[1]),
  		Math.abs(ent.transformComponent.transform.scale[2])];
  		
  	function setScale(e1){
		if(e1 !== ent){
			scl[0] *= Math.abs(e1.transformComponent.transform.scale[0]);
			scl[1] *= Math.abs(e1.transformComponent.transform.scale[1]);
			scl[2] *= Math.abs(e1.transformComponent.transform.scale[2]);
		}
	}
	//fix scaleing issues for all parents
	ent.traverseUp(setScale);
  	//var scl = [Math.abs(pTrans.scale[0] / entScl[0]), Math.abs(pTrans.scale[1] / entScl[1]), Math.abs(pTrans.scale[2] / entScl[2])];
  	if(ent.meshDataComponent && ent.meshDataComponent.meshData){
  		var md = ent.meshDataComponent.meshData;
  		if(md instanceof goo.Box){
			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl[0], md.yExtent * scl[1], md.zExtent * scl[2]]});
  		}else if(md instanceof goo.Sphere){
  			col = AmmoUtil.createSphereColliderComponent({radius:md.radius * scl[0]});
  		}else if(md instanceof goo.Quad){
  			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl[0], md.yExtent * scl[1], 0.01]});
  		}else if(md instanceof goo.Cylinder){
  			col = AmmoUtil.createCylinderZColliderComponent({radius:md.radius * scl[0], halfHeight:scl[2] * 0.5});
  		}else if(md instanceof goo.Cone){
  			var offset = new goo.Vector3(0, 0, -md.height * scl[2] * 0.5);
  			col = AmmoUtil.createConeZColliderComponent({radius:md.radius * scl[0], height:md.height * scl[2]});
  			col.offset = offset;
  		}else{
  			// mesh
	  		col = AmmoUtil.createMeshColliderComponent({scale:scl, entity:ent});
  		}
  	}
  	else{
  		col = AmmoUtil.createCompoundColliderComponent({entity:ent});
  	}
  	return col;
  };
  
AmmoUtil.ActivationState = {
  	ACTIVE_TAG:1,
  	ISLAND_SLEEPING:2,
  	WANTS_DEACTIVATION:3,
  	DISABLE_DEACTIVATION:4,
  	DISABLE_SIMULATION:5};
  	
AmmoUtil.CollisionFlags = {
	CF_STATIC_OBJECT:1,
	CF_KINEMATIC_OBJECT:2,
	CF_NO_CONTACT_RESPONSE:4,
	CF_CUSTOM_MATERIAL_CALLBACK:8,
	CF_CHARACTER_OBJECT:16,
	CF_DISABLE_VISUALIZE_OBJECT:32,
	CF_DISABLE_SPU_COLLISION_PROCESSING:64};
  	
  AmmoUtil.createRigidBodyComponent = function(args, ent){
	function RigidBodyComponent(){
		args = args || {};
  		this.type = 'RigidBodyComponent';
  		this.mass = args.mass || 0.0;
  	//	this.oldPos = new goo.Vector3();
  	//	this.oldQuat = new goo.Quaternion();
  		var collider = ent.getComponent("ColliderComponent");
  		if(undefined === collider){
  			collider = args.collider || AmmoUtil.getColliderFromGooShape(ent, goo);
  			if(null === collider){
  				console.error("Could not identify collider info!");
  				return;
  			}
  			ent.setComponent(collider);
  		}
  		var startTransform = new Ammo.btTransform();
  		startTransform.setIdentity();
		var gooPos = ent.transformComponent.transform.translation;
		if(collider.offset){
			vec.copy(collider.offset);
			ent.transformComponent.transform.rotation.applyPost(vec);
			gooPos.subv(vec);
		}
	//	this.oldPos.copy(gooPos);
		var gooRot = ent.transformComponent.transform.rotation;
		var localInertia = new Ammo.btVector3(0, 0, 0);
		if(this.mass !== 0){
			collider.shape.calculateLocalInertia(this.mass, localInertia);
		}
		startTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		quat.fromRotationMatrix(gooRot);
	//	this.oldQuat.setd(quat.x, quat.y, quat.z, quat.z);
		startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		var myMotionState = new Ammo.btDefaultMotionState(startTransform);
		var rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, myMotionState, collider.shape, localInertia);
		this.body = new Ammo.btRigidBody(rbInfo);
		Ammo.destroy(rbInfo);
  	}
  	RigidBodyComponent.prototype = Object.create(goo.Component.prototype);
  	RigidBodyComponent.constructor = RigidBodyComponent;
	
  	RigidBodyComponent.prototype.updateVisuals = function(ent){
 		var tc = ent.transformComponent;
  		var pos = tc.transform.translation;
  		var rot = tc.transform.rotation;
  		var col = ent.colliderComponent;
 		
  		this.body.getMotionState().getWorldTransform(ptrans);
  		//ptrans = this.body.getCenterOfMassTransform();
  		
		pvec = ptrans.getOrigin();
		pos.setd(pvec.x(), pvec.y(), pvec.z());
		if(col.offset){
			vec.copy(col.offset);
			rot.applyPost(vec);
			pos.addv(vec);
		}
		
		ptrans.getBasis().getRotation(pquat);
		quat.setd(
			pquat.x(),
			pquat.y(), 
			pquat.z(),
			pquat.w());
		quat.toRotationMatrix(rot);
		
		tc.setUpdated();
  	};
  	RigidBodyComponent.prototype.setTranslation = function(vec3){
  		pvec.setValue(vec3[0], vec3[1], vec3[2]);
		var trans = this.body.getWorldTransform();
		trans.setOrigin(pvec);
		this.body.getMotionState().setWorldTransform(trans);
  	};
  	RigidBodyComponent.prototype.setRotation = function(mat3x3){
  		quat.fromRotationMatrix(mat3x3);
  		pquat.setValue(quat.x, quat.y, quat.z, quat.w);
		var trans = this.body.getWorldTransform();
		trans.getBasis().setRotation(pquat);
		this.body.getMotionState().setWorldTransform(trans);
		this.body.setCenterOfMassTransform(trans);
  	};
  	RigidBodyComponent.prototype.setLinearVelocity = function(vec3){
  		pvec.setValue(vec3.x, vec3.y, vec3.z);
		this.body.setLinearVelocity(pvec);
  	};
  	RigidBodyComponent.prototype.setAngularVelocity = function(vec3){
  		pvec.setValue(vec3.x, vec3.y, vec3.z);
		this.body.setAngularVelocity(pvec);
  	};
  	
  	RigidBodyComponent.prototype.forceActivationState = function(state){
  		this.body.forceActivationState((typeof(state) === 'number') ? state : AmmoUtil.ActivationState[state]);
  	};
  	RigidBodyComponent.prototype.setActivationState = function(state){
  		this.body.setActivationState((typeof(state) === 'number') ? state : AmmoUtil.ActivationState[state]);
  	};
  	RigidBodyComponent.prototype.getActivationState = function(state){
  		return this.body.getActivationState();
  	};
  	RigidBodyComponent.prototype.setLinearFactor = function(vec3){
  		pvec.setValue(vec3[0], vec3[1], vec3[2]);
  		this.body.setLinearFactor(pvec);
  	};
  	RigidBodyComponent.prototype.setAngularFactor = function(vec3){
  		pvec.setValue(vec3[0], vec3[1], vec3[2]);
  		this.body.setAngularFactor(pvec);	
  	};
  	
  	var rigidBody = new RigidBodyComponent;
  	return rigidBody;
  	
  };
  AmmoUtil.createBoxColliderComponent = function(args){
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
  AmmoUtil.createSphereColliderComponent = function(args){
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
  AmmoUtil.createConeZColliderComponent = function(args){
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
  AmmoUtil.createCylinderZColliderComponent = function(args){
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
  AmmoUtil.createCylinderXColliderComponent = function(args){
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
  AmmoUtil.createCylinderYColliderComponent = function(args){
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
  AmmoUtil.createMeshColliderComponent = function(args){
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
  AmmoUtil.createCompoundColliderComponent = function(args){
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
				var gooPos = new goo.Vector3();
				gooPos.copy(child.transformComponent.transform.translation);
				gooPos.mulv(args.entity.transformComponent.transform.scale);
				if(childCol.offset){
					vec.copy(childCol.offset);
					child.transformComponent.transform.applyForwardVector(childCol.offset, vec);
					gooPos.subv(vec);
				}
				localTrans.setOrigin(new Ammo.btVector3(gooPos[0], gooPos[1], gooPos[2]));
				var gooRot = child.transformComponent.transform.rotation;
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
  };
  var global = global || window;
  global.AmmoUtil = AmmoUtil;
}(window, document, undefined));
