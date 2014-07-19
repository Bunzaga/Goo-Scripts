(function(window, document){
	function Attachment(){}
  
	Attachment.prototype.attach = function(args, ctx, goo){
		ctx.parent = ctx.entity.transformComponent.parent;
		ctx.parent = ctx.parent.entity;
	      
		ctx.entity.transformComponent.attachChild(ctx.attachee.transformComponent);
		ctx.entity.transformComponent.setUpdated();
		
		Attachment.fixScale(ctx.attachee);
	
		var pose = ctx.parent.animationComponent._skeletonPose;
		ctx.jointTransform = pose._globalTransforms[args.jointIndex];
	}
	Attachment.prototype.remove = function(args, ctx, goo){
		ctx.parent.transformComponent.detachChild(ctx.attachee.transformComponent);
	}

	Attachment.prototype.update = function(args, ctx, goo){
		ctx.attachee.transformComponent.transform.matrix.copy(ctx.jointTransform.matrix);
		ctx.jointTransform.matrix.getTranslation(ctx.attachee.transformComponent.transform.translation);
		ctx.jointTransform.matrix.getScale(ctx.attachee.transformComponent.transform.scale);
		ctx.jointTransform.matrix.getRotation(ctx.attachee.transformComponent.transform.rotation);
		Attachment.updateWorldTransform(ctx.attachee.transformComponent);
		ctx.attachee.transformComponent._dirty = true;
	}
	
	Attachment.fixScale = function(e1){
		function setScale(e2){
			e1.transformComponent.transform.scale.div(e2.transformComponent.transform.scale);
		}
		e1.traverseUp(setScale);
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
  
  
	Attachment.parameters = [
	{
		name: 'Joint',
		key: 'jointIndex',
		type: 'int',
		control: 'jointSelector',
		default: -1
	}];

	var global = global || window;
	global.Attachment = Attachment;
}(window, document, undefined));
