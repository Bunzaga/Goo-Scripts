(function(window, document){
  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){
  	this.attachee = args.attachee;
        this.parent = ctx.entity.transformComponent.parent.entity;
        
        this.parent.transformComponent.attachChild(this.attachee.transformComponent);
        this.parent.transformComponent.setUpdated();
        
	this.offsetScale = new goo.Vector3(1,1,1);
        this.attachee.traverseUp(function(ent){
        	this.offsetScale.mulv(ent.transformComponent.transform.scale);
        })
        var pose = this.parent.animationComponent._skeletonPose;
        this.jointTransform = pose._globalTransforms[args.jointIndex];
  }
  Attachment.prototype.remove = function(args, ctx, goo){
    this.parent.transformComponent.detachChild(args.attachee.transformComponent);
  }
	Attachment.prototype.update = function(args, ctx, goo){
		this.attachee.transformComponent.transform.matrix.copy(this.jointTransform.matrix);
		this.jointTransform.matrix.getTranslation(this.attachee.transformComponent.transform.translation);
		this.jointTransform.matrix.getScale(this.attachee.transformComponent.transform.scale);
		this.jointTransform.matrix.getRotation(this.attachee.transformComponent.transform.rotation);
		Attachment.updateWorldTransform(this.attachee.transformComponent);
		this.attachee.transformComponent._dirty = true;
	}
	Attachment.updateWorldTransform = function(transformComponent){
		transformComponent.updateWorldTransform();
		var entity = transformComponent.entity;
		if (entity && entity.meshDataComponent && entity.meshRendererComponent){
			entity.meshRendererComponent.updateBounds(
			entity.meshDataComponent.modelBound,
			transformComponent.worldTransform);
			transformComponent.transform.scale.mulv(this.offsetScale);
		}
		
		for (var i = 0; i < transformComponent.children.length; i++) {
			Attachment.updateWorldTransform(transformComponent.children[i]);
		}
	}
  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
