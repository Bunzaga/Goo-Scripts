(function(window, document){
// args.bone(String), args.attachee(Entity), args.offsetPos(Vector3), args.offsetRot(Vector3), args.offsetScl(Vector3)

  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){
    //if(null === ctx.entity.meshDataComponent){console.error("ctx.entity requires a MeshDataComponent(Perhaps use a child entity?).");return;}
     //   if(null == ctx.entity.meshDataComponent.currentPose){console.error("ctx.entity requires a skeleton");return;}
        //var meshData = ctx.entity.meshDataComponent,
        //joints = meshData.currentPose._skeleton._joints,
        ctx.parent = ctx.entity.transformComponent.parent;
        ctx.parent = ctx.parent.entity;
        var pose = ctx.parent.animationComponent._skeletonPose;
	var jointTransform = pose._globalTransforms[args.jointIndex];

        var a = ctx.world.createEntity(ctx.attachee.name+"_Attachment");
        
        a.oldScale = new goo.Vector3().copy(ctx.attachee.transformComponent.transform.scale);
        ctx.attachee.transformComponent.setScale(1,1,1);

        if(ctx.offsetScl){
            a.transformComponent.setScale(ctx.offsetScl);
            console.log("ctx.offsetScl");
            console.log(ctx.offsetScl);
        }
        a.addToWorld();
        ctx.parent.transformComponent.attachChild(a.transformComponent);
        ctx.parent.transformComponent.setUpdated();

        a.transformComponent.attachChild(ctx.attachee.transformComponent);
        a.transformComponent.setUpdated();

        if(ctx.offsetPos){
            ctx.attachee.transformComponent.setTranslation(
                ctx.offsetPos[0]*(1/ctx.entity.transformComponent.transform.scale[0]),
                ctx.offsetPos[1]*(1/ctx.entity.transformComponent.transform.scale[1]),
                ctx.offsetPos[2]*(1/ctx.entity.transformComponent.transform.scale[2]));
            console.log("ctx.offsetPos");
            console.log(ctx.offsetPos);
        }
 
        if(ctx.offsetRot){
            ctx.attachee.transformComponent.transform.rotation.fromAngles(ctx.offsetRot[0], ctx.offsetRot[1], ctx.offsetRot[2]);
            console.log("ctx.offsetRot");
            console.log(ctx.offsetRot);
        }
        ctx.attachee.transformComponent.setUpdated();

        a.parentMeshData = meshData;
        a.parentJointID = jointID;
        
        ctx.entity.attachment = a;
        console.log("ctx.entity.attachment");
        console.log(ctx.entity.attachment);
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
    var m = ctx.entity.attachment.parentMeshData.currentPose._globalTransforms[ctx.entity.attachment.parentJointID].matrix;
    var t = ctx.entity.attachment.transformComponent.transform;
    m.getTranslation(t.translation);           
    t.rotation.set(
        m.e00, m.e10, m.e20,
        m.e01, m.e11, m.e21,
        m.e02, m.e12, m.e22
    );
    ctx.entity.attachment.transformComponent.updateTransform();
    ctx.entity.attachment.transformComponent.updateWorldTransform();
    ctx.entity.attachment.transformComponent.setUpdated();
  }
  Attachment.parameters = [
    {
	name: 'Joint',
	key: 'jointIndex',
	type: 'int',
	control: 'jointSelector',
	default: null
	},
    {key:'offsetPos', type:'vec3', default:[0.0, 0.0, 0.0]},
    {key:'offsetRot', type:'vec3', default:[0.0, 0.0, 0.0]},
    {key:'offsetScl', type:'vec3', default:[1.0, 1.0, 1.0]}
    ];

  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
