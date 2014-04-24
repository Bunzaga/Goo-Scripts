function setup(args, ctx, goo){
	if(undefined === ctx.picking){
		ctx.picking = new goo.PickingSystem({pickLogic: new goo.PrimitivePickLogic()});
		ctx.v1 = new goo.Vector3();
		ctx.v2 = new goo.Vector3();
		ctx.cross = new goo.Vector3();

		var SimplePick = {};
		SimplePick.ray = new goo.Ray();
		// extend our 'primitive pick logic' with something a little less primitive
		var hitSort = function(a, b){
			return a.distance-b.distance;
		}
		ctx.picking.onPick = function(result){
			var hit = null;
			console.log(result);
			if(null !== result){
				if(result.length > 0){
					var distance = typeof ctx.picking.pickRay.distance !== 'undefined' ? ctx.picking.pickRay.distance : Infinity;
					var rayDir = ctx.picking.pickRay.direction;
					if(ctx.picking.mask){
						if(ctx.picking.all){ // add all non-culled faces to hit array
							for(var i = 0, ilen = result.length; i < ilen; i++){
								if((result[i].entity.hitMask & ctx.picking.mask) !== 0){
									for(var j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
										var entDistance = result[i].intersection.distances[j];
										if(entDistance < distance){
											// create two CCW 'edge vectors' based on the points of the face hit
											var v0 = result[i].intersection.vertices[j][0];
											var v1 = result[i].intersection.vertices[j][1];
											var v2 = result[i].intersection.vertices[j][2];
												
											goo.Vector3.subv(v0, v1, ctx.v1);
											goo.Vector3.subv(v0, v2, ctx.v2);
											//ctx.v1.normalize();
											//ctx.v2.normalize();
											
											// use the cross product of the face edges to get the 'normal'
											goo.Vector3.cross(ctx.v1, ctx.v2, ctx.cross);
											ctx.cross.normalize();
											
											var dot = goo.Vector3.dot(ctx.cross, rayDir);
											if(dot < 0){
												if(null === hit){
													hit = [];
												}
												hit.push({
													entity: result[i].entity,
													point: new goo.Vector3().copy(result[i].intersection.points[j]),
													normal: new goo.Vector3().copy(ctx.cross),
													vertices:[
														new goo.Vector3().copy(v0),
														new goo.Vector3().copy(v1),
														new goo.Vector3().copy(v2)],
													distance: entDistance
												});
											}
										}
									}
								}
							}
							if(hit && hit.length > 1){
								hit.sort(hitSort);
							}
						}
						else{ // only return the closest non-culled face
							for(i = 0, ilen = result.length; i < ilen; i++){
								if((result[i].entity.hitMask & ctx.picking.mask) !== 0){
									for(j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
										entDistance = result[i].intersection.distances[j];
										if(entDistance < distance){
											// create two CCW 'edge vectors' based on the points of the face hit
											v0 = result[i].intersection.vertices[j][0];
											v1 = result[i].intersection.vertices[j][1];
											v2 = result[i].intersection.vertices[j][2];
											
											goo.Vector3.subv(v0, v1, ctx.v1);
											goo.Vector3.subv(v0, v2, ctx.v2);
											//ctx.v1.normalize();
											//ctx.v2.normalize();
											
											// use the cross product of the face edges to get the 'normal'
											goo.Vector3.cross(ctx.v1, ctx.v2, ctx.cross);
											ctx.cross.normalize();
											
											dot = goo.Vector3.dot(ctx.cross, rayDir);
											// dot the normal with the ray.dir to see if it is backfacing or not
											// if not backfacing
											if(dot < 0){
												distance = result[i].intersection.distances[j];
												if(null === hit){
													hit = {
														entity: result[i].entity,
														point: new goo.Vector3().copy(result[i].intersection.points[j]),
														normal: new goo.Vector3().copy(ctx.cross),
														vertices:[
															new goo.Vector3().copy(v0),
															new goo.Vector3().copy(v1),
															new goo.Vector3().copy(v2)],
														distance: entDistance
													}
												}
												else{
													hit.entity = result[i].entity;
													hit.point.copy(result[i].intersection.points[j]);
													hit.normal.copy(ctx.cross);
													hit.vertices[0].copy(v0);
													hit.vertices[1].copy(v1);
													hit.vertices[2].copy(v2);
													hit.distance = entDistance;
												}
											}
										}
									}
								}
							}
						}
					}
					else{
						console.error("SimplePick.castRay: You must pass in a mask as the second parameter.");
					}
				}
			}
			ctx.picking.hit = hit;
		}
		
		SimplePick.added = function(ent){ctx.picking.added(ent);}
		
		SimplePick.castRay = function(ray, mask, all){
			ctx.picking.pickRay = ray;
			ctx.picking.mask = mask;
			ctx.picking.all = all;
			ctx.picking._process();
			return ctx.picking.hit;
		}
	}
    
	if(undefined === ctx.world.getSystem("PickingSystem")){
		ctx.world.setSystem(ctx.picking);
	}

	if(undefined === ctx.worldData.SimplePick){
		ctx.worldData.SimplePick = SimplePick;
	}
}

function cleanup(args, ctx, goo){
	var index = ctx.world._systems.indexOf(ctx.picking);
	if(index !== -1){
		ctx.world._systems.splice(index, 1);
	}
	delete ctx.picking;
	delete ctx.worldData.SimplePick;
}
