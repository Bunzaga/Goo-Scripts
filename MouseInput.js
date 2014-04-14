/* Implement this method to do initializing */
var _ctx;
var setup = function(args, ctx, goo) {
	_ctx = ctx;
	ctx.entityData.buttons = {};
	ctx.entityData.callbacks = {};
	ctx.entityData.stringToCode = {"leftMouse":1, "rightMouse":2, "middleMouse":3, "mouseWheel":4, "mouseMove":5};

	ctx.worldData.MouseInput = {};
	ctx.worldData.MouseInput.movement = new goo.Vector2();
	ctx.worldData.MouseInput.delta = new goo.Vector2();
	ctx.worldData.MouseInput.old = new goo.Vector2();
	ctx.worldData.MouseInput.position = new goo.Vector2();
	
	ctx.worldData.MouseInput.getButton = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : _ctx.entityData.stringToCode[btnCode];
		return args.buttons[btn];
	}
	
	ctx.worldData.MouseInput.bind = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : _ctx.entityData.stringToCode[btnCode];
		_ctx.entityData.buttons[btn] = false;
		if(callback){
			if(typeof callback === 'function'){
				_ctx.entityData.callbacks[btn] = callback;
			}
		}
		return 	_ctx.worldData.MouseInput;
	}

	ctx.worldData.MouseInput.unbind = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : _ctx.entityData.stringToCode[btnCode];
		delete _ctx.entityData.buttons[btn];
		delete _ctx.entityData.callbacks[btn];
		return 	_ctx.worldData.MouseInput;
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
	if(null == _ctx.entityData.buttons[4]){return;}
	if(null == _ctx.entityData.callbacks[4]){return;}
	_ctx.entityData.callbacks[4](wheelDelta);
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
	if(null == _ctx.entityData.buttons[btn]){return;}
	if(true == _ctx.entityData.buttons[btn]){return;}
	_ctx.entityData.buttons[btn] = true;
	if(null == _ctx.entityData.callbacks[btn]){return;}
	_ctx.entityData.callbacks[btn](true);
	
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
	if(null == _ctx.entityData.buttons[btn]){return;}
	if(false == _ctx.entityData.buttons[btn]){return;}
	_ctx.entityData.buttons[btn] = false;
	if(null == _args.entityData.callbacks[btn]){return;}
	_ctx.entityData.callbacks[btn](false);
};

var mouseMove = function(e){
	updateMousePos(e);
	if(null == _ctx.entityData.buttons[5]){return;}
	if(null == _ctx.entityData.callbacks[5]){return;}
	_ctx.entityData.callbacks[5]();
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
	_ctx.worldData.MouseInput.movement.x = e.movementX;
	_ctx.worldData.MouseInput.movement.y = e.movementY;
	_ctx.worldData.MouseInput.delta.x = newX - _ctx.worldData.MouseInput.position.x;
	_ctx.worldData.MouseInput.delta.y = newY - _ctx.worldData.MouseInput.position.y;
	_ctx.worldData.MouseInput.old.x = _ctx.worldData.MouseInput.position.x;
	_ctx.worldData.MouseInput.old.y = _ctx.worldData.MouseInput.position.y;
	_ctx.worldData.MouseInput.position.x = newX;
	_ctx.worldData.MouseInput.position.y = newY;
};
