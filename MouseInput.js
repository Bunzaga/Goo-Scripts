/* Implement this method to do initializing */
var _args = null;
var _ctx = null;
var setup = function(args, ctx, goo) {
	_args = args;
	_ctx = ctx;
	document.body.addEventListener('mousemove', mouseMove, false);
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	document.body.removeEventListener('mousemove', mouseMove, false);
	_args = null;
	_ctx = null;
};

function mouseMove(e){
	updateMousePos(e);
	_ctx.world.em.raise("MouseMove");
}

function updateMousePos(e){
	e = e || window.event;
	if (e && e.preventDefault) {e.preventDefault();}
	if (e && e.stopPropagation) {e.stopPropagation();}
	
	var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
		(document.body.scrollLeft - document.documentElement.clientLeft);
		
	var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
		(document.body.scrollTop - document.documentElement.scrollTop);

	newX -= _ctx.domElement.offsetLeft;
	newY -= _ctx.domElement.offsetTop;
//	Input.movement.x = e.movementX;
//	Input.movement.y = e.movementY;
//	Input.mouseDelta.x = newX - Input.mousePosition.x;
//	Input.mouseDelta.y = newY - Input.mousePosition.y;
//	Input.mouseOld.x = Input.mousePosition.x;
//	Input.mouseOld.y = Input.mousePosition.y;
//	Input.mousePosition.x = newX;
//	Input.mousePosition.y = newY;
	console.log(newX+","+newY);
};

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
