(function(window, document){
	var empty = {};
	Object.seal(empty);
	
	var vec = new goo.Vector3();
	var rot = new goo.Matrix3x3();
	var tmpTransform = new goo.Transform();

	function updateWorldTransform(ent){
		ent.transformComponent.updateWorldTransform();
		if(ent.meshDataComponent && ent.meshRendererComponent){
			ent.meshRendererComponent.updateBounds(
				ent.meshDataComponent.modelBound,
				ent.transformComponent.worldTransform
			);
		}
	};

	function AttachComponent(pEnt, jointIndex, trans, rot, scl){
		goo.Component.call(this, arguments);
		this.type = 'AttachComponent';
		this.targetEntity = pEnt;
		this.jointIndex = jointIndex;
		this.offsetTranslation = new goo.Vector3(0, 0, 0);
		this.offsetRotation = new goo.Matrix3x3();
		this.offsetScale = new goo.Vector3(1, 1, 1);
		this.copyTranslation = (trans === undefined) ? true : trans;
		this.copyRotation = (rot === undefined) ? true : rot;
		this.copyScale = (scl === undefined) ? true : scl;
	};
	AttachComponent.prototype = Object.create(goo.Component.prototype);
	AttachComponent.prototype.constructor = AttachComponent;

	AttachComponent.prototype.attach = function(pEnt, jointIndex, trans, rot, scl){
		this.targetEntity = pEnt;
		if(undefined === this.targetEntity){console.log('this.parent undefined'); return;}
		this.jointIndex = jointIndex;
		if(undefined === this.jointIndex){console.log('this.jointIndex undefined'); return;}
		if(undefined === this.targetEntity.animationComponent || undefined === this.targetEntity.animationComponent._skeletonPose) {console.log('no _skeletonPose');return;}
		
		this.copyTranslation = (trans === undefined) ? true : trans;
		this.copyRotation = (rot === undefined) ? true : rot;
		this.copyScale = (scl === undefined) ? true : scl;
		
		this.offsetTranslation = new goo.Vector3();
		this.offsetRotation = new goo.Vector3();
		this.offsetScale = new goo.Vector3(1, 1, 1);
		
		this.targetEntity.attachChild(this._entity);
	//	this.targetEntity.transformComponent.setUpdated();
	};
	
	AttachComponent.prototype.detach = function(){
		this.jointIndex = -1;
		this.offsetTranslation.setDirect(0, 0, 0);
		this.offsetRotation.setDirect(0, 0, 0);
		this.offsetScale.setDirect(1, 1, 1);
		
		this.copyTranslation = true;
		this.copyRotation = true;
		this.copyScale = true;
		this._entity.transformComponent.parent.entity.detachChild(ent);
		this._entity.transformComponent.transform.translation.scale.copy(this._oldScale);
	};
  
	function AttachSystem(){
		goo.System.call(this, 'AttachSystem', ['AttachComponent']);
		this.priority = 1;
	};
	AttachSystem.prototype = Object.create(goo.System.prototype);
	AttachSystem.prototype.constructor = AttachSystem;
	
	AttachSystem.prototype.inserted = function(ent){
		var trans = ent.transformComponent.transform;
		var ac = ent.attachComponent;
		ac._oldScale = new goo.Vector3(trans.scale);
		ac._entity = ent;
		ac.attach(ac.targetEntity, ac.jointIndex, ac.copyTranslation, ac.copyRotation, ac.copyScale);
	}
	AttachSystem.prototype.deleted = function(ent){
		ent.transformComponent.parent.entity.detachChild(ent);
		ent.transformComponent.transform.scale.setVector(ent.attachComponent._oldScale);
		ent.clearComponent('AttachComponent');
		ent.transformComponent.setUpdated();
	};
	
	AttachSystem.prototype.process = function(ents, tpf){
		for(var i = ents.length; i--;){
			var ent = ents[i];
			var trans = ent.transformComponent.transform;
			var ac = ent.attachComponent;
			if (undefined === ac.targetEntity.animationComponent || undefined === ac.targetEntity.animationComponent._skeletonPose) { console.log('no animationComponent stuff.');return; }
			var p = ac.targetEntity.animationComponent._skeletonPose;
			var j = p._globalTransforms[ac.jointIndex];
			if (!j) { console.log('no joint '+ac.jointIndex); return; }
			
			var m = j.matrix;
			var pScale = ac.targetEntity.transformComponent.worldTransform.scale;
			if(true === ac.copyScale){
				vec.x = (ac._oldScale.x / pScale.x)
				vec.y = (ac._oldScale.y / pScale.y)
				vec.z = (ac._oldScale.z / pScale.z)
				vec.mul(pScale);
			}
			else{
				vec.x = (ac._oldScale.x / pScale.x);
				vec.y = (ac._oldScale.y / pScale.y);
				vec.z = (ac._oldScale.z / pScale.z);
			}
			
			trans.scale.copy(vec);
			var pRot = ac.targetEntity.transformComponent.worldTransform.rotation;
    		m.getRotation(rot);
    		rot.rotateX(ac.offsetRotation.x);
    		rot.rotateY(ac.offsetRotation.y);
    		rot.rotateZ(ac.offsetRotation.z);
    		
    		trans.rotation.copy(rot);
    		m.getTranslation(vec);
    		vec.mul(0.01);
    		vec.addVector(ac.offsetTranslation);
			trans.translation.copy(vec);
			
			ent.transformComponent.updateTransform();
			ent.transformComponent.updateWorldTransform();
			ent.traverse(updateWorldTransform);
		}
	};
	
	var global = global || window;
	global.AttachSystem = AttachSystem;
	global.AttachComponent = AttachComponent;
}(window, document, undefined));
