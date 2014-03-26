/* Implement this method to do initializing */
var _args = null;
var _ctx = null;
var state = 0;
var setup = function(args, ctx, goo) {
	_args = args;
	_args.rot = 0;
	_ctx = ctx;
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	_args = null;
	_ctx = null;
};

function mouseTest(){
	console.log(_ctx.world.MouseInput.delta.x);
	_args.rot += _ctx.world.MouseInput.delta.x * 0.01;
	_ctx.entity.transformComponent.transform.rotation.fromAngles(0, _args.rot, 0);
	_ctx.entity.transformComponent.setUpdated();
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
			ctx.world.em.bind("MouseMove", _args, mouseTest);
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
var parameters = [];
