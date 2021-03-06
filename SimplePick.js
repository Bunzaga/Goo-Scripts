(function(window, document, undefined){
	var SimplePick = {};
	SimplePick.ready = false;
	var picking, v1, v2, cross, args, ctx, goo;
	SimplePick.setup = function(_args, _ctx, _goo){
		args = _args;
		ctx = _ctx;
		goo = _goo;
		picking = new goo.PickingSystem({pickLogic: new goo.PrimitivePickLogic()});
		v1 = new goo.Vector3();
		v2 = new goo.Vector3();
		cross = new goo.Vector3();

		// use when picking so you don't need to create a 'new' ray
		SimplePick.ray = new goo.Ray();
		// extend our 'primitive pick logic' with something a little less primitive
		var hitSort = function(a, b){
			return a.distance - b.distance;
		};
		picking.onPick = function(result){
			var hit = null;
			if(null !== result){
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
												
											// use the cross product of the face edges to get the 'normal'
											goo.Vector3.cross(v1, v2, cross);
											
											var dot = goo.Vector3.dot(cross, rayDir);
											if(dot < 0 || true === picking.pickRay.backfaces){
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
												
											// use the cross product of the face edges to get the 'normal'
											goo.Vector3.cross(v1, v2, cross);
												
											dot = goo.Vector3.dot(cross, rayDir);
											if(dot < 0 || true === picking.pickRay.backfaces){
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
		};
		if(undefined === ctx.world.getSystem("PickingSystem")){
			ctx.world.setSystem(picking);
		}
		else{
			console.warn("PickingSystem already exists in the world!");
		}
		SimplePick.ready = true;
	}

	SimplePick.added = function(ent){picking.added(ent);};
	
	SimplePick.castRay = function(ray, mask, all){
		picking.pickRay = ray;
		picking.mask = mask;
		picking.all = all;
		picking._process();
		return picking.hit;
	};
    
	SimplePick.cleanup = function(){
		var index = ctx.world._systems.indexOf(picking);
		if(index !== -1){
			ctx.world._systems.splice(index, 1);
		}
		delete SimplePick.ray;
		args = undefined;
		ctx = undefined;
		goo = undefined;
		SimplePick.ready = false;
	};

	var global = global || window;
	global.SimplePick = SimplePick;
})(window, document);
