(function(window, document){
// args.bone(String), args.attachee(Entity), args.offsetPos(Vector3), args.offsetRot(Vector3), args.offsetScl(Vector3)

  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){
        ctx.parent = ctx.entity.transformComponent.parent;
        ctx.parent = ctx.parent.entity;
        console.log("ctx.parent");
        console.log(ctx.parent);

        ctx.parent.transformComponent.attachChild(ctx.attachee);
        ctx.parent.transformComponent.setUpdated();

        var pose = ctx.parent.animationComponent._skeletonPose;
        ctx.jointTransform = pose._globalTransforms[args.jointIndex];
  }
  Attachment.prototype.remove = function(args, ctx, goo){
    ctx.attachee.transformComponent.transform.translation.copy(ctx.attachee.transformComponent.worldTransform.translation);
    ctx.attachee.transformComponent.transform.rotation.copy(ctx.attachee.transformComponent.worldTransform.rotation);
    ctx.entity.transformComponent.detachChild(ctx.entity.attachment.transformComponent);
    ctx.entity.attachment.transformComponent.detachChild(ctx.attachee.transformComponent);
    ctx.attachee.transformComponent.setScale(ctx.entity.attachment.oldScale.x,ctx.entity.attachment.oldScale.y,ctx.entity.attachment.oldScale.z);
    ctx.entity.attachment.removeFromWorld();
        delete ctx.entity.attachment;
  }
	Attachment.prototype.update = function(args, ctx, goo){
		ctx.attachee.transformComponent.transform.matrix.copy(ctx.jointTransform.matrix);
		ctx.jointTransform.matrix.getTranslation(ctx.attachee.transformComponent.transform.translation);
		ctx.jointTransform.matrix.getScale(ctx.attachee.transformComponent.transform.scale);
		ctx.jointTransform.matrix.getRotation(ctx.attachee.transformComponent.transform.rotation);
		Attachment.updateWorldTransform(ctx.attachee.transformComponent);
		ctx.entity.attachment.transformComponent._dirty = true;
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
			updateWorldTransform(transformComponent.children[i]);
		}
	}
  
  
  Attachment.parameters = [
    {
	name: 'Joint',
	key: 'jointIndex',
	type: 'int',
	control: 'jointSelector',
	default: null
	}];

  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
