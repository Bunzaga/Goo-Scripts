/* Implement this method to do initializing */
var setup = function(args, ctx, goo) {
	ctx.buttons = {};
	ctx.stringToCode = {"left":1, "right":2, "middle":4, "wheel":8, "move":16};
	ctx.offsetLeft = ctx.domElement.getBoundingClientRect().left;
	ctx.offsetTop = ctx.domElement.getBoundingClientRect().top;

	var MouseInput = {};
	MouseInput.movement = new goo.Vector2();
	MouseInput.delta = new goo.Vector2();
	MouseInput.old = new goo.Vector2();
	MouseInput.position = new goo.Vector2();
	MouseInput.getButton = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
		return ctx.buttons[btn];
	}
	MouseInput.bind = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
		ctx.buttons[btn] = false;
		if(callback){
			if(typeof callback === 'function'){
				console.log("MouseInput.bind:ctx.callbacks["+btnCode+"]");
				goo.SystemBus.addListener("MouseInput"+btn, callback);
			}
		}
		return MouseInput;
	}
	MouseInput.unbind = function(btnCode, callback){
		if(null === callback){
			console.warn("MouseInput.unbind: You should pass in the callback to remove, did you mean 'MouseInput.unbindAll ?");
			MouseInput.unbindAll(btnCode);
			return MouseInput;
		}
		var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
		if(undefined !== ctx.buttons[btn]){
			if(typeof callback === 'function'){
				goo.SystemBus.removeListener("MouseInput"+btn, callback);
			}
		}
		return MouseInput;
	}
	MouseInput.unbindAll = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
		goo.SystemBus.removeAllOnChannel("MouseInput"+btn);
		return MouseInput;
	}
	ctx.mouseWheel = function(e){
		e = e || window.event;
		var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		goo.SystemBus.emit("MouseInput8", wheelDelta);
	};
	ctx.mouseDown = function(e){
		var btn = 0;
		if(null === e.which){
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
			}
		}
		if(true === ctx.buttons[btn]){return;}
		ctx.buttons[btn] = true;
		goo.SystemBus.emit("MouseInput"+btn, true);
	};
	ctx.mouseUp = function(e){
		//updateMousePos(e);
		var btn = 0;
		if(null === e.which){
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
			}
		}
		if(false === ctx.buttons[btn]){return;}
		ctx.buttons[btn] = false;
		goo.SystemBus.emit("MouseInput"+btn, false);
	};
	ctx.mouseMove = function(e){
		ctx.updateMousePos(e);
		goo.SystemBus.emit("MouseInput16", false);
	}
	ctx.updateMousePos = function(e){
		e = e || window.event;
		if (e && e.preventDefault) {e.preventDefault();}
		if (e && e.stopPropagation) {e.stopPropagation();}

		var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
			(document.body.scrollLeft - document.documentElement.clientLeft);

		var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
			(document.body.scrollTop - document.documentElement.scrollTop);

		newX -= (ctx.offsetLeft + ctx.domElement.offsetLeft);
		newY -= (ctx.offsetTop + ctx.domElement.offsetTop);
		MouseInput.movement.x = e.movementX;
		MouseInput.movement.y = e.movementY;
		MouseInput.delta.x = newX - MouseInput.position.x;
		MouseInput.delta.y = newY - MouseInput.position.y;
		MouseInput.old.x = MouseInput.position.x;
		MouseInput.old.y = MouseInput.position.y;
		MouseInput.position.x = newX;
		MouseInput.position.y = newY;
	};

	document.documentElement.addEventListener('mousedown', ctx.mouseDown, false);
	document.documentElement.addEventListener('mouseup', ctx.mouseUp, false);
	document.documentElement.addEventListener('mousemove', ctx.mouseMove, false);
	document.documentElement.addEventListener("mousewheel", ctx.mouseWheel, false);
	document.documentElement.addEventListener("DOMMouseScroll", ctx.mouseWheel, false); // Firefox

	ctx.worldData.MouseInput = MouseInput;
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	for(var i in ctx.buttons){
		goo.SystemBus.removeAllOnChannel("MouseInput"+i);
	}
	document.documentElement.removeEventListener('mousemove', ctx.mouseMove, false);
	document.documentElement.removeEventListener('mousedown', ctx.mouseDown, false);
	document.documentElement.removeEventListener('mouseup', ctx.mouseUp, false);
	document.documentElement.removeEventListener("mousewheel", ctx.mouseWheel, false);
	document.documentElement.removeEventListener("DOMMouseScroll", ctx.mouseWheel, false); // Firefox
	delete ctx.worldData.MouseInput;
};
