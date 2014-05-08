function SimplePick(args, ctx, goo){
	var picking = new goo.PickingSystem({pickLogic: new goo.PrimitivePickLogic()});
	var v1 = new goo.Vector3();
	var v2 = new goo.Vector3();
	var cross = new goo.Vector3();


	this.ray = new goo.Ray();
	// extend our 'primitive pick logic' with something a little less primitive
	var hitSort = function(a, b){
		return a.distance-b.distance;
	}
	picking.onPick = function(result){
		var hit = null;
		if(null !== result){
		console.log(result);
			if(result.length > 0){
				var distance = typeof picking.pickRay.distance !== 'undefined' ? picking.pickRay.distance : Infinity;
				var rayDir = picking.pickRay.direction;
				if(picking.mask){
					if(picking.all){ // add all non-culled faces to hit array
						for(var i = 0, ilen = result.length; i < ilen; i++){
							if((result[i].entity.hitMask & picking.mask) !== 0){
								for(var j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
									var entDistance = result[i].intersection.distances[j];
									if(entDistance < distance){
										// create two CCW 'edge vectors' based on the points of the face hit
										var vert0 = result[i].intersection.vertices[j][0];
										var vert1 = result[i].intersection.vertices[j][1];
										var vert2 = result[i].intersection.vertices[j][2];
											
										goo.Vector3.subv(vert0, vert1, v1);
										goo.Vector3.subv(vert0, vert2, v2);
										//ctx.v1.normalize();
										//ctx.v2.normalize();
										
										// use the cross product of the face edges to get the 'normal'
										goo.Vector3.cross(v1, v2, cross);
										cross.normalize();
										
										var dot = goo.Vector3.dot(cross, rayDir);
										if(dot < 0){
											if(null === hit){
												hit = [];
											}
											hit.push({
												entity: result[i].entity,
												point: new goo.Vector3().copy(result[i].intersection.points[j]),
												normal: new goo.Vector3().copy(cross),
												vertices:[
													new goo.Vector3().copy(vert0),
													new goo.Vector3().copy(vert1),
													new goo.Vector3().copy(vert2)],
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
							if((result[i].entity.hitMask & picking.mask) !== 0){
								for(j = 0, jlen = result[i].intersection.distances.length; j < jlen; j++){
									entDistance = result[i].intersection.distances[j];
									if(entDistance < distance){
										// create two CCW 'edge vectors' based on the points of the face hit
										vert0 = result[i].intersection.vertices[j][0];
										vert1 = result[i].intersection.vertices[j][1];
										vert2 = result[i].intersection.vertices[j][2];
										
										goo.Vector3.subv(vert0, vert1, v1);
										goo.Vector3.subv(vert0, vert2, v2);
										//ctx.v1.normalize();
										//ctx.v2.normalize();
										
										// use the cross product of the face edges to get the 'normal'
										goo.Vector3.cross(v1, v2, cross);
										cross.normalize();
										
										dot = goo.Vector3.dot(cross, rayDir);
										// dot the normal with the ray.dir to see if it is backfacing or not
										// if not backfacing
										if(dot < 0){
											distance = result[i].intersection.distances[j];
											if(null === hit){
												hit = {
													entity: result[i].entity,
													point: new goo.Vector3().copy(result[i].intersection.points[j]),
													normal: new goo.Vector3().copy(cross),
													vertices:[
														new goo.Vector3().copy(vert0),
														new goo.Vector3().copy(vert1),
														new goo.Vector3().copy(vert2)],
													distance: entDistance
												}
											}
											else{
												hit.entity = result[i].entity;
												hit.point.copy(result[i].intersection.points[j]);
												hit.normal.copy(cross);
												hit.vertices[0].copy(vert0);
												hit.vertices[1].copy(vert1);
												hit.vertices[2].copy(vert2);
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
		picking.hit = hit;
	}
	
	this.added = function(ent){picking.added(ent);}
	
	this.castRay = function(ray, mask, all){
		picking.pickRay = ray;
		picking.mask = mask;
		picking.all = all;
		picking._process();
		return picking.hit;
	}
    
	if(undefined === ctx.world.getSystem("PickingSystem")){
		ctx.world.setSystem(picking);
	}

	/*if(undefined === ctx.worldData.SimplePick){
		ctx.worldData.SimplePick = this;
	}*/

	this.cleanup = function(args, ctx, goo){
		var index = ctx.world._systems.indexOf(picking);
		if(index !== -1){
			ctx.world._systems.splice(index, 1);
		}
		delete ctx.worldData.SimplePick;
	}
}
