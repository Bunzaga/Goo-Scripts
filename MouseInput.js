/* Implement this method to do initializing */
var _args = null;
var _ctx = null;
var setup = function(args, ctx, goo) {
	_args = args;
	_ctx = ctx;
	args.buttons = {};
	args.callbacks = {};
	
	args.stringToCode = {"leftMouse":1, "rightMouse":2, "middleMouse":3, "mouseWheel":4, "mouseMove":5};

	ctx.world.MouseInput = {};
	ctx.world.MouseInput.movement = new goo.Vector2();
	ctx.world.MouseInput.delta = new goo.Vector2();
	ctx.world.MouseInput.old = new goo.Vector2();
	ctx.world.MouseInput.position = new goo.Vector2();
	
	ctx.world.MouseInput.getButton = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : args.stringToCode[btnCode];
		return args.buttons[btn];
	}
	
	ctx.world.MouseInput.bind = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : args.stringToCode[btnCode];
		args.buttons[btn] = false;
		if(callback){
			if(typeof callback === 'function'){
				args.callbacks[btn] = callback;
			}
		}
		return 	ctx.world.MouseInput;
	}

	ctx.world.MouseInput.unbind = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : args.stringToCode[btnCode];
		delete args.buttons[btn];
		delete args.callbacks[btn];
		return 	ctx.world.MouseInput;
	}
	
	document.documentElement.addEventListener('mousedown', mouseDown, false);
	document.documentElement.addEventListener('mouseup', mouseUp, false);
	document.documentElement.addEventListener('mousemove', mouseMove, false);
	document.documentElement.addEventListener("mousewheel", mouseWheel, false);
	document.documentElement.addEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	document.documentElement.removeEventListener('mousemove', mouseMove, false);
	document.documentElement.removeEventListener('mousedown', mouseDown, false);
	document.documentElement.removeEventListener('mouseup', mouseUp, false);
	document.documentElement.removeEventListener("mousewheel", mouseWheel, false);
	document.documentElement.removeEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
};

var mouseWheel = function(e){
	e = e || window.event;
	var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
	if(null == _args.buttons[4]){return;}
	if(null == _args.callbacks[4]){return;}
	_args.callbacks[4](wheelDelta);
};

var mouseDown = function(e){
	var btn = 0;
	if(null == e.which){
		btn = e.button;
	}
	else{
		switch(e.which){
			case 1:
				btn = 1;
				break;
			case 2:
				btn = 4;
				break;
			case 3:
				btn = 2;
				break;
		};
	}
	if(null == _args.buttons[btn]){return;}
	if(true == _args.buttons[btn]){return;}
	_args.buttons[btn] = true;
	if(null == _args.callbacks[btn]){return;}
	_args.callbacks[btn](true);
	
};
var mouseUp = function(e){
	updateMousePos(e);
	var btn = 0;
	if(null == e.which){
		btn = e.button;
	}
	else{
		switch(e.which){
			case 1:
				btn = 1;
				break;
			case 2:
				btn = 4;
				break;
			case 3:
				btn = 2;
				break;
		};
	}
	if(null == _args.buttons[btn]){return;}
	if(false == _args.buttons[btn]){return;}
	_args.buttons[btn] = false;
	if(null == _args.callbacks[btn]){return;}
	_args.callbacks[btn](false);
};

var mouseMove = function(e){
	updateMousePos(e);
	if(null == _args.buttons[5]){return;}
	if(null == _args.callbacks[5]){return;}
	_args.callbacks[5]();
}


var updateMousePos = function(e){
	e = e || window.event;
	if (e && e.preventDefault) {e.preventDefault();}
	if (e && e.stopPropagation) {e.stopPropagation();}
	
	var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
		(document.body.scrollLeft - document.documentElement.clientLeft);
		
	var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
		(document.body.scrollTop - document.documentElement.scrollTop);

	newX -= _ctx.domElement.offsetLeft;
	newY -= _ctx.domElement.offsetTop;
	_ctx.world.MouseInput.movement.x = e.movementX;
	_ctx.world.MouseInput.movement.y = e.movementY;
	_ctx.world.MouseInput.delta.x = newX - _ctx.world.MouseInput.position.x;
	_ctx.world.MouseInput.delta.y = newY - _ctx.world.MouseInput.position.y;
	_ctx.world.MouseInput.old.x = _ctx.world.MouseInput.position.x;
	_ctx.world.MouseInput.old.y = _ctx.world.MouseInput.position.y;
	_ctx.world.MouseInput.position.x = newX;
	_ctx.world.MouseInput.position.y = newY;
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
//var update = function(args, ctx, goo) {};

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
