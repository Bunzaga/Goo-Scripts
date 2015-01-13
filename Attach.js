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
		this.attach(pEnt, jointID, trans, rot, scl);
	};
	Attach.Component.prototype = Object.create(goo.Component.prototype);
	Attach.Component.prototype.constructor = Attach.Component;
	Attach.Component.prototype.attach = function(pEnt, jointID, trans, rot, scl){
		console.log('Attach.Component.attach()');
		this.parent = pEnt || undefined;
		this.jointID = jointID || undefined;
		this.jointIndex = -1;
		this.copyTranslation = trans || true;
		this.copyRotation = rot || true;
		this.copyScale = rot || true;
		if(undefined === this.parent){console.log('this.parent undefined'); return;}
		if(undefined === this.jointID){console.log('this.jointID undefined'); return;}
		if (undefined === this.parent.animationComponent || undefined === this.parent.animationComponent._skeletonPose) {console.log('no _skeletonPose');return;}
		var pose = this.parent.animationComponent._skeletonPose;
		var joints = pose._skeleton._joints;
		for(var i = 0, ilen = joints.length; i < ilen; i++){
			if(joints[i]._name === this.jointID){
				this.jointIndex = i;
			}
		}
		if(-1 === this.jointIndex){console.log('this.jointTrans undefined'); return;}
	};
	Attach.Component.prototype.detach = function(){
		this.jointID = undefined;
		this.jointIndex = -1;
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
			var trans = ent.transformComponent.transform;
			var ac = ent.attachComponent;
			if (undefined === ac.parent.animationComponent || undefined === ac.parent.animationComponent._skeletonPose) { return; }
			var p = ac.parent.animationComponent._skeletonPose;
			var j = p._globalTransforms[ac.jointIndex];
			if (!j) { return; }
			var m = j.matrix;
            		m.getTranslation(trans.translation);
            		trans.translation.addVector(ac.parent.transformComponent.worldTransform.translation);
            		console.log(trans.scale.x+","+trans.scale.y+","+trans.scale.z);
            		//m.getRotation(trans.rotation);
            		//trans.rotation.rotateZ(Math.PI*0.5);
            		console.log(trans.scale.x+","+trans.scale.y+","+trans.scale.z);
			trans.rotation.set(
				m.e00, m.e10, m.e20,
				m.e01, m.e11, m.e21,
				m.e02, m.e12, m.e22
			);
			//ent.transformComponent.updateTransform();
			//ent.transformComponent.updateWorldTransform();
			//ent.traverse(Attach.updateWorldTransform);
			m.getScale(trans.scale);
			trans.scale.x = 1/trans.scale.x;
			trans.scale.y = 1/trans.scale.y;
			trans.scale.z = 1/trans.scale.z;
			
			ent.transformComponent.updateTransform();
			ent.transformComponent.updateWorldTransform();
			ent.transformComponent.setUpdated();
			//ent.transformComponent._dirty = true;

		}
	};
	
	Attach.System.prototype.inserted = function(ent){
		console.log('Attach.System.prorotype.inserted()');
		console.log(ent.name);
	}
  
	var global = global || window;
	global.Attach = Attach;
}(window, document, undefined));
