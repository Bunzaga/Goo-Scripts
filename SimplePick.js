var setup = function(args, ctx, goo){
	if(undefined === ctx.picking){
		ctx.picking = new goo.PickingSystem({pickLogic: new goo.PrimitivePickLogic()});
		ctx.v1 = new goo.Vector3();
		ctx.v2 = new goo.Vector3();
		ctx.cross = new goo.Vector3();

		var SimplePick = {};
		SimplePick.ray = new goo.Ray();
		// extend our 'primitive pick logic' with something a little less primitive
		ctx.picking.onPick = function(result){
			var hit = null;
			if(null !== result){
				if(result.length > 0){
					var hitIndex = -1;
					var hitElement = -1;
					var mrc = null;
					var distance = typeof ctx.picking.pickRay.distance !== 'undefined' ? ctx.picking.pickRay.distance : Infinity;
					for(var i = 0, ilen = result.length; i < ilen; i++){
						mrc = result[i].entity.meshRendererComponent;
						if(null === mrc){console.log("entity.meshRenderComponent does not exist!");}
						else{
							if(null !== result[i].entity.hitMask){
								if((result[i].entity.hitMask & ctx.picking.mask) !== 0){
									for(var j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
										if(result[i].intersection.distances[j] < distance){
											if(ctx.picking.all){
											}
											else{
												distance = result[i].intersection.distances[j];
												hitIndex = i;
												hitElement = j;
											}
										}
									}
								}
							}
						}
					}
					if(hitIndex != -1){
						// create two CCW 'edge vectors' based on the points of the face hit
						ctx.v1.x = result[hitIndex].intersection.vertices[hitElement][0].x - result[hitIndex].intersection.vertices[hitElement][1].x;
						ctx.v1.y = result[hitIndex].intersection.vertices[hitElement][0].y - result[hitIndex].intersection.vertices[hitElement][1].y;
						ctx.v1.z = result[hitIndex].intersection.vertices[hitElement][0].z - result[hitIndex].intersection.vertices[hitElement][1].z;
	
						ctx.v2.x = result[hitIndex].intersection.vertices[hitElement][2].x - result[hitIndex].intersection.vertices[hitElement][0].x;
						ctx.v2.y = result[hitIndex].intersection.vertices[hitElement][2].y - result[hitIndex].intersection.vertices[hitElement][0].y;
						ctx.v2.z = result[hitIndex].intersection.vertices[hitElement][2].z - result[hitIndex].intersection.vertices[hitElement][0].z;
						
						// use the cross product of the face edges to get the 'normal'
						ctx.cross.x = (ctx.v1.y * ctx.v2.z) - (ctx.v1.z * ctx.v2.y);
						ctx.cross.y = (ctx.v1.z * ctx.v2.x) - (ctx.v1.x * ctx.v2.z);
						ctx.cross.z = (ctx.v1.x * ctx.v2.y) - (ctx.v1.y * ctx.v2.x);
						ctx.cross.normalize();
	
						// use the dot product to determine if the normal is facing the origin
						// of the ray or not *** doesn't work ***
						//	dp = (-cross.x * ray.direction.x) + (-cross.y * ray.direction.y) + (-cross.z * ray.direction.z);
	
						hit = {
							entity: result[hitIndex].entity,
							point: new goo.Vector3().copy(result[hitIndex].intersection.points[hitElement]),
							normal: new goo.Vector3().copy(ctx.cross),
							distance: result[hitIndex].intersection.distances[hitElement]
						}
					}
				}
			}
			ctx.picking.hit = hit;
		};
		
		SimplePick.castRay = function(ray, mask, all){
			ctx.picking.pickRay = ray;
			ctx.picking.mask = mask;
			ctx.picking.all = all;
			ctx.picking._process();
			return ctx.picking.hit;
		};
	}
    
	if(undefined === ctx.world.getSystem("PickingSystem")){
		ctx.world.setSystem(ctx.picking);
	}

	if(undefined === ctx.worldData.SimplePick){
		ctx.worldData.SimplePick = SimplePick;
	}
}

var cleanup = function(args, ctx, goo){
	var index = ctx.world._systems.indexOf(ctx.picking);
	if(index !== -1){
		ctx.world._systems.splice(index, 1);
	}
	delete ctx.worldData.SimplePick;
}
