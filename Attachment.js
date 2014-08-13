(function(window, document){
  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){
        args.attachee.parent = ctx.entity;
        
        //this.parent.transformComponent.attachChild(this.attachee.transformComponent);
        //this.parent.transformComponent.setUpdated();
        
	var offsetScale = new goo.Vector3();
	offsetScale.copy(args.attachee.transformComponent.transform.scale);

        args.attachee.parent.traverseUp(function(ent){
        	offsetScale.mulv(ent.transformComponent.transform.scale);
        });
        var pose = null;
        args.attachee.parent.traverseUp(function(ent){
        	if(ent.animationComponent){
        		pose = ent.animationComponent._skeletonPose;
        		return false;
        	}
        });
        if(pose !== null){
        	//var pose = this.parent.animationComponent._skeletonPose;
        	args.attachee.jointTransform = pose._globalTransforms[args.jointIndex];
        	args.attachee.offsetScale = offsetScale;
        }
        console.log(args.attachee.offsetScale);
  }
  Attachment.prototype.remove = function(args, ctx, goo){
    this.parent.transformComponent.detachChild(args.attachee.transformComponent);
  }
	Attachment.prototype.update = function(args, ctx, goo){
		args.attachee.transformComponent.transform.matrix.copy(args.attachee.jointTransform.matrix);
		args.attachee.jointTransform.matrix.getTranslation(args.attachee.transformComponent.transform.translation);
		args.attachee.jointTransform.matrix.getScale(args.attachee.transformComponent.transform.scale);
		args.attachee.jointTransform.matrix.getRotation(args.attachee.transformComponent.transform.rotation);
		Attachment.updateWorldTransform(args.attachee.transformComponent);
		args.attachee.transformComponent._dirty = true;
	}
	Attachment.updateWorldTransform = function(transformComponent){
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent){
			entity.meshRendererComponent.updateBounds(
			entity.meshDataComponent.modelBound,
			transformComponent.worldTransform);
			transformComponent.transform.scale.mulv(args.attachee.offsetScale);
		}
		
		for (var i = 0; i < transformComponent.children.length; i++) {
			Attachment.updateWorldTransform(transformComponent.children[i]);
		}
	}
  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
