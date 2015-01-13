(function(window, document){
	var Attach = {};
	Attach.updateWorldTransform = function(transformComponent){
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent){
			entity.meshRendererComponent.updateBounds(
			entity.meshDataComponent.modelBound,
			transformComponent.worldTransform);
		}
		
		for (var i = 0; i < transformComponent.children.length; i++) {
			Attach.updateWorldTransform(transformComponent.children[i]);
		}
	};

	Attach.Component = function(pEnt, jointID, trans, rot, scl){
		goo.Component.apply(this, arguments);
		this.type = 'AttachComponent';
		this.offsetTranslation = new goo.Vector3(0, 0, 0);
		this.offsetRotation = new goo.Matrix3x3();
		this.offsetScale = new goo.Vector3(0, 0, 0);
		this.attach(parent, jointID, trans, rot, scl);
	};
	Attach.Component.prototype = Object.create(goo.Object.prototype);
	Attach.Component.prototype.constructor = Attach.Component;
	Attach.Component.prototype.attach = function(pEnt, jointID, trans, rot, scl){
		this.parent = pEnt || undefined;
		this.jointID = jointID || undefined;
		this.jointTrans = undefined;
		this.copyTranslation = pos || true;
		this.copyRotation = rot || true;
		this.copyScale = rot || true;
		if(undefined === this.parent){return;}
		if(undefined === this.jointID){return;}
		if (!this.parent.animationComponent || !this.parent.animationComponent._skeletonPose) {return;}
		var pose = this.parent.animationComponent._skeletonPose;
		var joints = pose._skeleton.joints;
		for(var i = 0, ilen = joints.length; i < ilen; i++){
			if(joints[i]._name === this.jointID){
				this.jointTrans = pose._globalTransforms[i];
			}
		}
		if(undefined === this.jointTrans){return;}
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
		for(var i = ents.length, ent = undefined; ent = ents[i--];){
			var ac = ent.attachComponent;
			var j = ac.jointTrans;
			if(undefined !== jointTrans){
	/*ctx.attachee.transformComponent.transform.matrix.copy(ctx.jointTransform.matrix);
	ctx.jointTransform.matrix.getTranslation(ctx.attachee.transformComponent.transform.translation);
	ctx.jointTransform.matrix.getScale(ctx.attachee.transformComponent.transform.scale);
	ctx.jointTransform.matrix.getRotation(ctx.attachee.transformComponent.transform.rotation);
	Attachment.updateWorldTransform(ctx.attachee.transformComponent);
	ctx.attachee.transformComponent._dirty = true;*/
			}
		}
	};
  
	var global = global || window;
	global.Attach = Attach;
}(window, document, undefined));
