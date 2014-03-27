/* Implement this method to do initializing */
var _args;
var _ctx;
var _goo;
var state = 0;
var setup = function(args, ctx, goo) {
	state = 0;
	_args = args;
	_ctx = ctx;
	_goo = goo;
	args.rot0 = 0;
	args.rot1 = 0;
	args.distance = 3.0;
	args.yMinLimit *= (Math.PI/180);
	args.yMaxLimit *= (Math.PI/180);
	args.pivot0 = ctx.world.by.name("User").first();
	args.pivot1 = ctx.world.by.name("Pivot1").first();
	args.cam = ctx.world.by.name("ViewCam").first();
	_args.pivot1.transformComponent.transform.translation.z = -(_args.distance*.2);
	_args.pivot1.transformComponent.setUpdated();
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	ctx.world.MouseInput.unbind("mouseMove", mouseMove);
	ctx.world.MouseInput.unbind("leftMouse", leftMouse);
	ctx.world.MouseInput.unbind("mouseWheel", mouseWheel);
	ctx.world.KeyInput.unbind("alt");
	_goo.GameUtils.exitPointerLock();
};

var mouseWheel = function(delta){
	_args.distance -= delta;
	if(_args.distance < _args.distanceMin){
		_args.distance = _args.distanceMin;
	}
	if(_args.distance > _args.distanceMax){
		_args.distance = _args.distanceMax;
	}
	_args.cam.transformComponent.transform.translation.z = _args.distance;
	_args.cam.transformComponent.setUpdated();
	_args.pivot1.transformComponent.transform.translation.z = -(_args.distance * .2);
	_args.pivot1.transformComponent.setUpdated();
}

var mouseMove = function(){
	_args.rot0 -= _ctx.world.MouseInput.movement.x * _args.xAxis;
	_args.rot1 -= _ctx.world.MouseInput.movement.y * _args.yAxis;
	_args.pivot0.transformComponent.transform.rotation.fromAngles(0, _args.rot0, 0);
	_args.pivot0.transformComponent.setUpdated();
	
	if(_args.rot1 > _args.yMaxLimit){
		_args.rot1 = _args.yMaxLimit;
	}
	if(_args.rot1 < _args.yMinLimit){
		_args.rot1 = _args.yMinLimit;
	}
	
	_args.pivot1.transformComponent.transform.rotation.fromAngles(_args.rot1, 0, 0);
	_args.pivot1.transformComponent.setUpdated();
}

var leftMouse = function(bool){
	if(bool){
		if(!document.pointerLockElement) {
			if(_ctx.world.KeyInput.getKey("alt")){
				_goo.GameUtils.requestPointerLock();
			}
		}
	}
}

/**
 * This function will be called every frame
 *
 * @param {object} parameters Contains all the parameters defined in externals.parameters
 * with values defined in the script panel
 *
 * @param {object} context A contextual data object unique for the script
 * {
 *  world: World,
 *  domElement: canvas
 *  viewportWidth: number
 *  viewportHeight: number
 *  activeCameraEntity: Entity
 *  entity: Entity
 * }
 * You can also add properties to this object that will be shared between the functions
 *
 * @param {object} goo Contains a bunch of helpful engine classes like
 * goo.Vector3, goo.Matrix3x3, etc. See api for more info
 */
var update = function(args, ctx, goo) {
	switch(state){
		case 0:
		if(ctx.world.em){
			ctx.world.MouseInput.bind("mouseMove", mouseMove);
			ctx.world.MouseInput.bind("leftMouse", leftMouse);
			ctx.world.MouseInput.bind("mouseWheel", mouseWheel);
			ctx.world.KeyInput.bind("alt");
			state = 1;
		}
		break;
	}
};

/**
 * Parameters follow:
 * {
 *  key: string,
 *  name?: string,
 *  type: enum ('int', 'float', 'string', 'boolean', 'vec3'),
 *  control?: enum (
 *   'slider', // For numbers with min and max.
 *   'color', // For vec3 that are RGB and should have color pickers.
 *   'select', // Used together with options.
 *  ),
 *  options?: *[] // Array of values of specified type.
 *  'default: *, // Depending of data type. Should be one of the options if options are used.
 *  min?: number, // Can be used when data type is float or int
 *  max?: number, // Can be used when data type is float or int
 *  scale?: number, // How fast number values will change when dragged up and down
 *  decimals?: number, // Override number of decimals. Int defaults to 0 and float to 2.
 *  exponential?: boolean, // Used together with slider
 * }
 */
var parameters = [
	{key:'xAxis', type:'float', default:0.001, decimals:3},
	{key:'yAxis', type:'float', default:0.001, decimals:3},
	{key:'yMinLimit', type:'float', default:-30.0, decimals:3},
	{key:'yMaxLimit', type:'float', default:30.0, decimals:3},
	{key:'distanceMin', type:'float', default:1, decimals:3},
	{key:'distanceMax', type:'float', default:10, decimals:3}
];
