(function(window, document, undefined){
	var _goo;
  var VehicleHelper = function(ammoSystem, entity, wheelRadius, suspensionLength, goo){
  	_goo = goo;
    this.entity = entity;
    this.quat = new goo.Quaternion();
    this.vec = new goo.Vector3();
    this.pvec = new Ammo.btVector3();
    this.pquat = new Ammo.btQuaternion();
  	this.body = entity.rigidBodyComponent.body;
  	this.wheelRadius = wheelRadius;
  	this.suspension = suspensionLength;
  	this.debugTires = [];
  
  	this.body.forceActivationState(4);
  	this.tuning = new Ammo.btVehicleTuning();
  	var vehicleRaycaster = new Ammo.btDefaultVehicleRaycaster(ammoSystem.ammoWorld);
  	this.vehicle = new Ammo.btRaycastVehicle(this.tuning, this.body, vehicleRaycaster);
  	ammoSystem.ammoWorld.addVehicle(this.vehicle);
  	this.vehicle.setCoordinateSystem(0,1,2); // choose coordinate system
  	this.wheelDir = new Ammo.btVector3(0,-1,0);
  	this.wheelAxle = new Ammo.btVector3(-1,0,0);
  
  	//chassis.ammoComponent.body.setAngularFactor(new Ammo.btVector3(0,1,0)); restrict angular movement
  }
  VehicleHelper.prototype.resetAtPos = function(vec3){
  	var b = this.body;
  	this.pvec.setValue(vec3[0], vec3[1], vec3[2]);
	var trans = this.body.getWorldTransform();
	trans.setOrigin(this.pvec);
	
	this.quat.fromRotationMatrix(_goo.Matrix3x3.IDENTITY);
	this.pquat.setValue(this.quat.x, this.quat.y, this.quat.z, this.quat.w);
	trans.getBasis().setRotation(this.pquat);
	b.setCenterOfMassTransform(trans);
  	b.getMotionState().setWorldTransform(trans);
  	
  	this.pvec.setValue(0, 0, 0)
  	b.setAngularVelocity(this.pvec);
  	b.setLinearVelocity(this.pvec);
  };
  VehicleHelper.prototype.setSteeringValue = function(steering) {
  	for(var i = 0, ilen = this.vehicle.getNumWheels(); i < ilen; i++){
  		if(this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel()){
  			this.vehicle.setSteeringValue(steering,i);
  		}
  	}
  };
  VehicleHelper.prototype.applyEngineForce = function(force, front) {
  	for(var i = 0, ilen = this.vehicle.getNumWheels(); i < ilen; i++){
  		if(front === undefined || this.vehicle.getWheelInfo(i).get_m_bIsFrontWheel() === front) {
  			this.vehicle.applyEngineForce(force,i);
  		}
  	}
  };
  VehicleHelper.prototype.setBrake = function(force) {
  	for(var i = 0, ilen = this.vehicle.getNumWheels(); i < ilen; i++){
  		this.vehicle.setBrake(force,i);
  	}
  };
  VehicleHelper.prototype.setWheelAxle = function(x, y, z) {
  	this.wheelAxle.setValue(x, y, z);
  };
  VehicleHelper.prototype.addFrontWheel = function(pos) {
  	this.addWheel(pos[0], pos[1], pos[2], true);
  };
  VehicleHelper.prototype.addRearWheel = function(pos) {
  	this.addWheel(pos[0], pos[1], pos[2], false);
  };
  VehicleHelper.prototype.addWheel = function(x,y,z, isFrontWheel){
    this.pvec.setValue(x, y, z);
  	var wheel = this.vehicle.addWheel(this.pvec,this.wheelDir,this.wheelAxle,this.suspension,this.wheelRadius,this.tuning,isFrontWheel);
  	wheel.set_m_suspensionStiffness(20);
  	wheel.set_m_wheelsDampingRelaxation(2.3);
  	wheel.set_m_wheelsDampingCompression(4.4);
  	wheel.set_m_frictionSlip(1000);
  	wheel.set_m_rollInfluence(0); // this value controls how easily a vehicle can tipp over. Lower values tipp less :)
  };
  VehicleHelper.prototype.updateWheelTransform = function(){
    // get the steering value of the vehicle
    var vs = this.vehicle.getSteeringValue();
    // get the current rotation of the vehicle entity
    this.entity.transformComponent.transform.rotation.toAngles(this.vec);

  	for(var i = 0, ilen = this.vehicle.getNumWheels(); i < ilen; i++){
  		// synchronize the wheels with the (interpolated) chassis worldtransform
  		this.vehicle.updateWheelTransform(i, true);
  		var dt = this.debugTires[i];
  		if(dt) {
  		  var r = this.vehicle.getWheelInfo(i).get_m_rotation() * 0.3;
  		  // if front wheels
        if(i < 2){
          // add the vehicle rotation to the vehicle steering
            dt.transformComponent.transform.rotation.fromAngles(r, vs + this.vec.y, 0);
        }
        else{ // if back
            dt.transformComponent.transform.rotation.fromAngles(r, this.vec.y, 0);
        }
        // update the position of the tires
  		  this.pvec = this.vehicle.getWheelInfo(i).get_m_worldTransform().getOrigin();
  		  dt.transformComponent.transform.translation.setd(this.pvec.x(), this.pvec.y(), this.pvec.z());
  			dt.transformComponent.setUpdated();
  		}
  	}
  };
  
  VehicleHelper.prototype.addDefaultWheels = function(bound){
  	this.wheelRadius = bound.xExtent / 3;
  	this.addFrontWheel([bound.xExtent, -0.06, bound.zExtent]);
  	this.addFrontWheel([-bound.xExtent, -0.06, bound.zExtent]);
  	this.addRearWheel([bound.xExtent, -0.06, -bound.zExtent]);
  	this.addRearWheel([-bound.xExtent, -0.06, -bound.zExtent]);
  };
  var global = global || window;
  global.VehicleHelper = VehicleHelper;
}(window, document));
