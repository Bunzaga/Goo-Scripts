(function(window, document){
  var AmmoUtil = {};
  var pvec;
  var ptrans;
  var pquat;
  var quat;
  AmmoUtil.createAmmoSystem = function(goo, args){
  	args = args || {};
	function AmmoSystem(){
		goo.System.call(this, 'AmmoSystem', ['AmmoRigidBody', 'TransformComponent']);
		this.collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(); // every single |new| currently leaks...
		this.dispatcher = new Ammo.btCollisionDispatcher(this.collisionConfiguration);
		this.overlappingPairCache = new Ammo.btDbvtBroadphase();
		this.solver = new Ammo.btSequentialImpulseConstraintSolver();
		this.dynamicsWorld = new Ammo.btDiscreteDynamicsWorld(this.dispatcher, this.overlappingPairCache, this.solver, this.collisionConfiguration);
		var pgrav = ammoWorld.setGravity();
		args.gravity = args.gravity || [0, -9.8, 0];
		pgrav.setValue(args.gravity[0], args.gravity[1], args.gravity[2]);
		this.dynamicsWorld.setGravity(pgrav);
	}
	AmmoSystem.prototype = Object.create(goo.System.prototype);
	AmmoSystem.constructor = AmmoSystem;
	
	AmmoSystem.prototype.inserted = function(gooEnt){
		this.ammoWorld.addRigidBody( ooEnt.ammoRigidBody.body);
	}
	
	var ammoSystem = new AmmoSystem();
	return ammoSystem;
  }
  
  AmmoUtil.createAmmoRigidBody = function(goo, ctx, args){
	function AmmoRigidbody(){
		args = args || {};
  		this.type = 'AmmoRigidBody';
  		this.mass = args.mass || 1.0;
  		this.colShape = args.colShape || AmmoUtils.createAmmoBoxComponent(goo, ent);
  		
  		var startTransform = new Ammo.btTransform();
		startTransform.setIdentity();
		
		var isDynamic = (this.mass != 0);
		var gooPos = ent.transformComponent.transform.translation;
		var gooRot = ent.transformComponent.transform.rotation;
		
		var localInertia = new Ammo.btVector3(0, 0, 0);
		if (isDynamic){
			colShape.calculateLocalInertia(this.mass, localInertia);
		}
		startTransform.setOrigin(new Ammo.btVector3(gooPos.x, gooPos.y, gooPos.z));
		
		quat = quat || new goo.Quaternion();
		quat.fromRotationMatrix(gooRot);
		ammoTransform.setRotation(new Ammo.btQuaternion(quat.x, quat.y, quat.z, quat.w));
		  
		var myMotionState = new Ammo.btDefaultMotionState(startTransform);
		var rbInfo = new Ammo.btRigidBodyConstructionInfo(this.mass, myMotionState, this.colShape, localInertia);
		this.body = new Ammo.btRigidBody(rbInfo);
  	}
  	AmmoRigidBody.prototype = Object.create(goo.Component.prototype);
  	AmmoRigidBody.constructor = AmmoRigidBody;
  
  	
  	var ammoRigidBody = new AmmoRigidBody;
  	return ammoRigidBody;
  	
  }
  AmmoUtil.createAmmoBoxComponent = function(goo, ent, args){
  	function AmmoBoxComponent(){
  		args = args || {};
  		args.halfExtents = args.halfExtents || [1,1,1];
  		this.type = 'AmmoShapeComponent';
  		this.ammoShape = new Ammo.btBoxShape(new Ammo.btVector3(args.halfExtents[0], args.halfExtentsargs[1], args.halfExtentsargs[2]));
  	}
  	AmmoBoxComponent.prototype = Object.create(goo.Component.prototype);
  	AmmoBoxComponent.constructor = AmmoBoxComponent;
  	
  	var ammoShape = new AmmoBoxComponent();
  	return ammoShape;
  }
  AmmoUtil.createAmmoCapsuleComponent = function(args, ctx, goo){
  	
  }
  AmmoUtil.createAmmoSphereComponent = function(args, ctx, goo){
  	
  }
  AmmoUtil.createAmmoMeshComponent = function(args, ctx, goo){
  	
  }
  AmmoUtil.createAmmoPlaneComponent = function(args, ctx, goo){
  	
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
