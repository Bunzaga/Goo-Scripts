(function(window, document){
  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){

        var parent = null;
        ctx.entity.traverseUp(function(ent){
        	if(ent.animationComponent){
        		parent = ent;
        		return false;
        	}
        });
        if(parent !== null){
        	pose = parent.animationComponent._skeletonPose;
        	args.attachee.jointTransform = pose._globalTransforms[args.jointIndex];
        	//args.attachee.offsetScale = new goo.Vector3().copy(parent.transformComponent.transform.scale);
        	//args.attachee.offsetScale.mulv(args.attachee.transformComponent.transform.scale);
        	parent.transformComponent.attachChild(args.attachee.transformComponent, true);
        }
        //console.log(args.attachee.offsetScale);
  }
  Attachment.prototype.remove = function(args, ctx, goo){
    args.parent.transformComponent.detachChild(args.attachee.transformComponent);
  }
	Attachment.prototype.update = function(args, ctx, goo){
		args.attachee.transformComponent.transform.matrix.copy(args.attachee.jointTransform.matrix);
		args.attachee.jointTransform.matrix.getTranslation(args.attachee.transformComponent.transform.translation);
		args.attachee.jointTransform.matrix.getScale(args.attachee.transformComponent.transform.scale);
		args.attachee.jointTransform.matrix.getRotation(args.attachee.transformComponent.transform.rotation);
		Attachment.updateWorldTransform(args.attachee.transformComponent);
		console.log(ctx.entity.transformComponent.transform.scale);
		//args.attachee.transformComponent.transform.scale.mulv(ctx.entity.transformComponent.transform.scale);
		args.attachee.transformComponent.transform.scale.mulv(args.attachee.transformComponent.transform.scale);
		args.attachee.transformComponent._dirty = true;
	}
	Attachment.updateWorldTransform = function(transformComponent){
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent){
			entity.meshRendererComponent.updateBounds(
			entity.meshDataComponent.modelBound,
			transformComponent.worldTransform);
		}
		
		for (var i = 0; i < transformComponent.children.length; i++) {
			Attachment.updateWorldTransform(transformComponent.children[i]);
		}
	}
  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
