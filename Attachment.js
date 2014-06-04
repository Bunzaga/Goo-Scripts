(function(window, document){
// args.bone(String), args.attachee(Entity), args.offsetPos(Vector3), args.offsetRot(Vector3), args.offsetScl(Vector3)

  function Attachment(){}
  
  Attachment.prototype.attach = function(args, ctx, goo){
    if(null === ctx.entity.meshDataComponent){console.error("ctx.entity requires a MeshDataComponent(Perhaps use a child entity?).");return;}
        if(null == ctx.entity.meshDataComponent.currentPose){console.error("ctx.entity requires a skeleton");return;}
        var meshData = ctx.entity.meshDataComponent,
        joints = meshData.currentPose._skeleton._joints,
        jointID = -1;
        var joint = null;
        
        for(var i = 0, ilen = joints.length; i < ilen; i++){
            if(joints[i]._name === args.bone){jointID = i;break;}
        }
        if(-1 == jointID){console.error("Could not find bone '"+args.bone+"' on ctx.entity.");return;}

        var a = ctx.world.createEntity(args.attachee.name+"_Attachment");
        a.oldScale = new goo.Vector3().copy(args.attachee.transformComponent.transform.scale);
        args.attachee.transformComponent.setScale(1,1,1);

        if(args.offsetScl){
            a.transformComponent.setScale(args.offsetScl);
        }
        a.addToWorld();
        ctx.entity.transformComponent.attachChild(a.transformComponent);
        ctx.entity.transformComponent.setUpdated();

        a.transformComponent.attachChild(args.attachee.transformComponent);
        a.transformComponent.setUpdated();

        if(args.offsetPos){
            args.attachee.transformComponent.setTranslation(
                args.offsetPos.x*(1/ctx.entity.transformComponent.transform.scale.x),
                args.offsetPos.y*(1/ctx.entity.transformComponent.transform.scale.y),
                args.offsetPos.z*(1/ctx.entity.transformComponent.transform.scale.z));
        }
 
        if(args.offsetRot){
            args.attachee.transformComponent.transform.rotation.fromAngles(args.offsetRot.x, args.offsetRot.y, args.offsetRot.z);
        }
        args.attachee.transformComponent.setUpdated();

        a.parentMeshData = meshData;
        a.parentJointID = jointID;
        //a.scale = 1.0;
        //a.calcVec = new goo.Vector3();
        
        ctx.entity.attachment = a;
        
  }
  Attachment.prototype.remove = function(){
  }
  Attachment.prototype.update = function(args, ctx, goo){
    var m = ctx.entity.attachment.parentMeshData.currentPose._globalTransforms[ctx.entity.attachment.parentJointID].matrix;
    var t = ctx.entity.attachment.transformComponent.transform;
    console.log(m);
    console.log(t);
    m.getTranslation(t.translation);           
    t.rotation.set(
        m.e00, m.e10, m.e20,
        m.e01, m.e11, m.e21,
        m.e02, m.e12, m.e22
    );

    ctx.entity.attachment.transformComponent.updateTransform();
    ctx.entity.attachment.transformComponent.updateWorldTransform();
  }
  Attachment.parameters = [
    {key:'bone', type:'string', default:"undefined"},
    {key:'offsetPos', type:'vec3', default:[0.0, 0.0, 0.0]},
    {key:'offsetRot', type:'vec3', default:[0.0, 0.0, 0.0]},
    {key:'offsetScl', type:'vec3', default:[1.0, 1.0, 1.0]}
    ];

  var global = global || window;
  global.Attachment = Attachment;
}(window, document, undefined));
