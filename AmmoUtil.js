// need to import https://kripken.github.io/ammo.js/builds/ammo.small.js

(function(window, document){
var 	AmmoUtil = {};
var 	pvec, pvec2, ptrans, pquat,
	quat, gooVec;

AmmoUtil.setup = function(){
	pvec = new Ammo.btVector3();
	pvec2 = new Ammo.btVector3();
	ptrans = new Ammo.btTransform();
	pquat = new Ammo.btQuaternion();
	quat = new goo.Quaternion();
	vec = new goo.Vector3();
	AmmoUtil.rigidBodies = {};
	AmmoUtil.colliders = {};
	AmmoUtil.collision = {};
	AmmoUtil.ready = true;
};
AmmoUtil.ready = false;

AmmoUtil.createAmmoSystem = function(args){
	function AmmoSystem(){
		this.priority = -Infinity;
		args = args || {};
		args.gravity = args.gravity || [0, -9.8, 0];
		goo.System.call(this, 'AmmoSystem', ['RigidBodyComponent', 'ColliderComponent']);
		this.fixedTime = 1/(args.stepFrequency || 60);
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
		if(ent.rigidBodyComponent && ent.colliderComponent) {
			this.ammoWorld.addRigidBody(ent.rigidBodyComponent.body);
		}
	};
	AmmoSystem.prototype.process = function(entities, tpf) {
		for(var key in AmmoUtil.collision){
			if(AmmoUtil.collision.hasOwnProperty(key)){
				AmmoUtil.collision[key].separated ++;
			}
		}
		
		var dp = this.dispatcher;
        	for(var i = 0, ilen = dp.getNumManifolds(); i < ilen; i++){
        		var manifold = dp.getManifoldByIndexInternal(i);
        		var num_contacts = manifold.getNumContacts();
		        if(num_contacts === 0){
				continue;
		        }
		        var bodyA = AmmoUtil.rigidBodies[manifold.getBody0()];
			var bodyB = AmmoUtil.rigidBodies[manifold.getBody1()];
			
			for (var j = 0; j < num_contacts; j++){
				var pt = manifold.getContactPoint(j);
				if(pt.getDistance() < 0.0){
					var colID = bodyA.entity.id+"_"+bodyB.entity.id;
					if(AmmoUtil.collision[colID] === undefined){
						pt.getPositionWorldOnA(pvec);
	        				pt.getPositionWorldOnB(pvec2);
						var normalOnB = pt.get_m_normalWorldOnB();
						var pointOnA = new goo.Vector3(pvec.x(), pvec.y(), pvec.z());
						var pointOnB = new goo.Vector3(pvec2.x(), pvec2.y(), pvec2.z());
						var normalOnB = new goo.Vector3(normalOnB.x(), normalOnB.y(), normalOnB.z());
						
						var info = {
							first:true,
							entityA:bodyA.entity,
							entityB:bodyB.entity,
							dataA:{other:bodyB.entity, pointA:pointOnA, pointB:pointOnB, normal:normalOnB},
							dataB:{other:bodyA.entity, pointA:pointOnB, pointB:pointOnA, normal:normalOnB}};
						
						AmmoUtil.collision[colID] = info;
					}
					AmmoUtil.collision[colID].separated = 0;
					break;
				}
			}
        	}
        	for(var key in AmmoUtil.collision){
			if(AmmoUtil.collision.hasOwnProperty(key)){
				if(true === AmmoUtil.collision[key].first){
					AmmoUtil.collision[key].first = false;
					var entA = AmmoUtil.collision[key].entityA;
					if(entA){
						var rbc = entA.getComponent('RigidBodyComponent');
						if(rbc){
							if(rbc.collisionBegin){
								rbc.collisionBegin(AmmoUtil.collision[key].dataA);
							}
						}
					}
					var entB = AmmoUtil.collision[key].entityB;
					if(entB){
						var rbc = entB.getComponent('RigidBodyComponent');
						if(rbc){
							if(rbc.collisionBegin){
								rbc.collisionBegin(AmmoUtil.collision[key].dataB);
							}
						}
					}
				}
				else{
					if(AmmoUtil.collision[key].separated > 1){
						var entA = AmmoUtil.collision[key].entityA;
						var entB = AmmoUtil.collision[key].entityB;
						if(entA){
							var rbc = entA.getComponent("RigidBodyComponent");
							if(rbc){
								if(rbc.collisionEnd){
									rbc.collisionEnd(entB);
								}
							}
						}
						if(entB){
							var rbc = entB.getComponent("RigidBodyComponent");
							if(rbc){
								if(rbc.collisionEnd){
									rbc.collisionEnd(entA);
								}
							}
						}
						delete AmmoUtil.collision[key];
					}
				}
			}
        	}
        	
        	this.ammoWorld.stepSimulation(tpf, this.maxSubSteps, this.fixedTime);
		for(var i = 0, ilen = entities.length; i < ilen; i++){
			var rbc = entities[i].getComponent('RigidBodyComponent');
			if(rbc.motionState){
				//if(rbc.active){
					rbc.updateVisuals(entities[i]);
				//}
			}
		}
	};
	AmmoSystem.prototype.deleted = function(ent){
		var rbc = ent.getComponent('RigidBodyComponent');
		if(rbc){
			var body = AmmoUtil.rigidBodies[rbc.ptr];
			if(body){
				delete AmmoUtil.rigidBodies[rbc.ptr];
				if(rbc.motionState){
					Ammo.destroy(rbc.motionState);
				}
				this.ammoWorld.removeCollisionObject(body);
				Ammo.destroy(body);
			}
			ent.clearComponent('RigidBodyComponent');
		}
		var cc = ent.getComponent('ColliderComponent');
		if(cc){
			var collider = AmmoUtil.colliders[cc.ptr];
			if(collider){
				delete AmmoUtil.colliders[cc.ptr];
				//Ammo.destroy(collider);
			}
			ent.clearComponent('ColliderComponent');
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
  	if(ammoSystem){
  		AmmoUtil.ready = false;
  		var index = world._systems.indexOf(ammoSystem);
  		if(index !== -1){
  			world._systems.splice(index, 1);
  		}
  		for(var key in AmmoUtil.collision){
			if(AmmoUtil.collision.hasOwnProperty(key)){
				delete AmmoUtil.collision[key];
			}
		}
  		for(var key in AmmoUtil.rigidBodies){
  			if(AmmoUtil.rigidBodies.hasOwnProperty(key)){
  				var body = AmmoUtil.rigidBodies[key];
  				var ent = body.entity;
  				if(ent){
	  				var rbc = ent.getComponent('RigidBodyComponent');
					if(rbc){
						delete AmmoUtil.rigidBodies[rbc.ptr];
						if(rbc.motionState){
							Ammo.destroy(rbc.motionState);
						}
						ammoSystem.ammoWorld.removeCollisionObject(body);
						Ammo.destroy(body);
						ent.clearComponent('RigidBodyComponent');
					}
					var cc = ent.getComponent('ColliderComponent');
					if(cc){
						delete AmmoUtil.colliders[cc.ptr];
						//Ammo.destroy(collider);
						ent.clearComponent('ColliderComponent');	
					}
  				}
  				
  			}
  		}
  				
  		
  		/*for(var i = ammoSystem._activeEntities.length-1; i >= 0; i--){
  			var ent = ammoSystem._activeEntities[i];
	  		if(ent.rigidBodyComponent){
				ent.clearComponent('RigidBodyComponent');
			}
			if(ent.colliderComponent){
				ent.clearComponent('ColliderComponent');
			}
  		}*/
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
  	}
  };
  
  AmmoUtil.getColliderFromGooShape = function(ent){
  	var col = null;
  	var scl = new goo.Vector3().copy(ent.transformComponent.worldTransform.scale);
  	//function setScale(e1){
  	//	if(e1 !== ent){
	//		scl.mulVector(e1.transformComponent.transform.scale);
  	//	}
	//}
	//fix scaleing issues for all parents
	//ent.traverseUp(setScale);
  	//var scl = [Math.abs(pTrans.scale[0] / entScl[0]), Math.abs(pTrans.scale[1] / entScl[1]), Math.abs(pTrans.scale[2] / entScl[2])];
  	if(ent.meshDataComponent && ent.meshDataComponent.meshData){
  		var md = ent.meshDataComponent.meshData;
  		if(md instanceof goo.Box){
			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl.x, md.yExtent * scl.y, md.zExtent * scl.z]});
  		}else if(md instanceof goo.Sphere){
  			col = AmmoUtil.createSphereColliderComponent({radius:md.radius * scl.x});
  		}else if(md instanceof goo.Quad){
  			col = AmmoUtil.createBoxColliderComponent({halfExtents:[md.xExtent * scl.x, md.yExtent * scl.y, 0.01]});
  		}else if(md instanceof goo.Cylinder){
  			col = AmmoUtil.createCylinderZColliderComponent({radius:md.radius * scl.x, halfHeight:scl.z * 0.5});
  		}else if(md instanceof goo.Cone){
  			var offset = new goo.Vector3(0, 0, -md.height * scl.z * 0.5);
  			col = AmmoUtil.createConeZColliderComponent({radius:md.radius * scl.x, height:md.height * scl.z});
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
	
  AmmoUtil.createCollider = function(ent){
  	var collider = ent.getComponent("ColliderComponent");
  	if(undefined === collider){
  		collider = AmmoUtil.getColliderFromGooShape(ent);
  	}
  	if(null === collider){
  		console.error("Could not identify collider info!");
  	}
  	return collider;
  }
  AmmoUtil.createRigidBodyComponent = function(args, ent){
	function RigidBodyComponent(){
		args = args || {};
  		this.type = 'RigidBodyComponent';
  		this.mass = args.mass || 0.0;
  		var collider = ent.getComponent("ColliderComponent");
  		if(undefined === collider){
  			collider = args.collider || AmmoUtil.getColliderFromGooShape(ent);
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
		var gooRot = ent.transformComponent.transform.rotation;
		var localInertia = new Ammo.btVector3(0, 0, 0);
		if(this.mass !== 0){
			collider.shape.calculateLocalInertia(this.mass, localInertia);
		}
		startTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		quat.fromRotationMatrix(gooRot);
		startTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		this.motionState = new Ammo.btDefaultMotionState(startTransform);
		var rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, this.motionState, collider.shape, localInertia);
		this.body = new Ammo.btRigidBody(rbInfo);
		this.ptr = this.body.a || this.body.ptr;
		this.body.entity = ent;
		this.enabled = true;
		AmmoUtil.rigidBodies[this.ptr] = this.body;
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
  		var col = this.body.entity.getComponent('ColliderComponent');
  		if(col.offset){
			vec.setv(col.offset);
			this.body.entity.transformComponent.transform.rotation.applyPost(vec);
			vec3.subv(vec);
		}
  		pvec.setValue(vec3.x, vec3.y, vec3.z);
		var trans = this.body.getWorldTransform();
		trans.setOrigin(pvec);
		this.body.getMotionState().setWorldTransform(trans);
	//	this.body.setCenterOfMassTransform(trans);
  	};
  	RigidBodyComponent.prototype.setRotation = function(mat3x3){
  		quat.fromRotationMatrix(mat3x3);
  		pquat.setValue(quat.x, quat.y, quat.z, quat.w);
		var trans = this.body.getWorldTransform();
		trans.getBasis().setRotation(pquat);
		this.body.getMotionState().setWorldTransform(trans);
	//	this.body.setCenterOfMassTransform(trans);
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
  	RigidBodyComponent.prototype.setCollisionFlags = function(flags){
  		this.body.setCollisionFlags((typeof(flags) === 'number') ? flags : AmmoUtil.CollisionFlags[flags]);
  	}
  	RigidBodyComponent.prototype.getCollisionFlags = function(){
  		return this.body.getCollisionFlags();	
  	};
  	RigidBodyComponent.prototype.applyImpulse = function(vec3a, vec3b){
  		pvec.setValue(vec3a[0], vec3a[1], vec3a[2]);
  		pvec2.setValue(vec3b[0], vec3b[1], vec3b[2]);
  		this.body.applyImpulse(pvec, pvec2);
  	};
  	RigidBodyComponent.prototype.applyTorque = function(vec3){
  		pvec.setValue(vec3[0], vec3[1], vec3[2]);
  		this.body.applyTorque(pvec);
  	};
  	RigidBodyComponent.prototype.addToAmmoSystem = function(){
  		var ent = this.body.entity;
		var body = this.body;
		var system = ent._world.getSystem("AmmoSystem");
		if(body){
			system.ammoWorld.addRigidBody(body);
			this.enabled = true;
		}
  	}
  	RigidBodyComponent.prototype.removeFromAmmoSystem = function(){
  		var ent = this.body.entity;
		var body = this.body;
		var system = ent._world.getSystem("AmmoSystem");
		if(body){
			system.ammoWorld.removeCollisionObject(body);
			this.enabled = false;
		}
  	}
  	
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
		AmmoUtil.colliders[this.ptr] = this;
  	}
  	BoxColliderComponent.prototype = Object.create(goo.Component.prototype);
  	BoxColliderComponent.constructor = BoxColliderComponent;
  	var shape = new BoxColliderComponent();
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
  	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
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
				//var scl = new goo.Vector3(1,1,1);
				//function setScale(ent){
				//	scl.mulVector(ent.transformComponent.transform.scale);
				//}
				//args.entity.traverseUp(setScale);
				//gooPos.mulv(scl);
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
	shape.ptr = shape.shape.a || shape.shape.ptr;
	AmmoUtil.colliders[shape.ptr] = shape.shape;
	return shape;
  };
  var global = global || window;
  global.AmmoUtil = AmmoUtil;
}(window, document, undefined));
