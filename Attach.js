(function(window, document){
	var Attach = {};
	Attach.updateWorldTransform = function(ent){
		ent.transformComponent.updateWorldTransform();
		if(ent.meshDataComponent && ent.meshRendererComponent){
			ent.meshRendererComponent.updateBounds(
				ent.meshDataComponent.modelBound,
				ent.transformComponent.worldTransform
			);
		}
	};

	Attach.Component = function(pEnt, jointID, trans, rot, scl){
		console.log('Attach.Component.constructor()');
		goo.Component.apply(this, arguments);
		this.type = 'AttachComponent';
		this.offsetTranslation = new goo.Vector3(0, 0, 0);
		this.offsetRotation = new goo.Matrix3x3();
		this.offsetScale = new goo.Vector3(1, 1, 1);
		this.attach(parent, jointID, trans, rot, scl);
	};
	Attach.Component.prototype = Object.create(goo.Component.prototype);
	Attach.Component.prototype.constructor = Attach.Component;
	Attach.Component.prototype.attach = function(pEnt, jointID, trans, rot, scl){
		console.log('Attach.Component.attach()');
		this.parent = pEnt || undefined;
		this.jointID = jointID || undefined;
		this.jointTrans = undefined;
		this.copyTranslation = trans || true;
		this.copyRotation = rot || true;
		this.copyScale = rot || true;
		if(undefined === this.parent){console.log('this.parent undefined'); return;}
		if(undefined === this.jointID){console.log('this.jointID undefined'); return;}
		if (!this.parent.animationComponent || !this.parent.animationComponent._skeletonPose) {console.log('no _skeletonPose');return;}
		var pose = this.parent.animationComponent._skeletonPose;
		var joints = pose._skeleton.joints;
		for(var i = 0, ilen = joints.length; i < ilen; i++){
			if(joints[i]._name === this.jointID){
				this.jointTrans = pose._globalTransforms[i];
			}
		}
		if(undefined === this.jointTrans){console.log('this.jointTrans undefined'); return;}
	};
	Attach.Component.prototype.detach = function(){
		this.jointID = undefined;
		this.joint = undefined;
		this.offsetTranslation.setDirect(0, 0, 0);
		this.offsetRotation.setIdentity();
		this.offsetScale.setDirect(1, 1, 1);
	};
  
	Attach.System = function(){
		goo.System.call(this, 'AttachSystem', ['AttachComponent']);
		this.priority = 1;
	};
	Attach.System.prototype = Object.create(goo.System.prototype);
	Attach.System.prototype.constructor = Attach.System;
	Attach.System.prototype.process = function(ents, tpf){
		console.log('Attach.System.process()');
		for(var i = ents.length; i--;){
			var ent = ents[i];
			console.log('entity:'+i);
			console.log(ent.name);
			var trans = ent.transformComponent.transform;
			var ac = ent.attachComponent;
			var j = ac.jointTrans;
			if(undefined !== j){
				//ctx.attachee.transformComponent.transform.matrix.copy(ctx.jointTransform.matrix);
				j.matrix.getTranslation(trans.translation);
				j.matrix.getScale(trans.scale);
				j.matrix.getRotation(trans.rotation);
				ent.traverse(Attach.updateWorldTransform);
				ent.transformComponent._dirty = true;
			}
		}
	};
	
	Attach.System.prototype.inserted = function(ent){
		console.log('Attach.System.prorotype.inserted()');
		console.log(ent.name);
	}
  
	var global = global || window;
	global.Attach = Attach;
}(window, document, undefined));
