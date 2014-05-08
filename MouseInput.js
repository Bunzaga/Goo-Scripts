function MouseInput (args, ctx, goo) {
	var buttons = {};
	var stringToCode = {"left":1, "right":2, "middle":4, "wheel":8, "move":16};
	var offsetLeft = ctx.domElement.getBoundingClientRect().left;
	var offsetTop = ctx.domElement.getBoundingClientRect().top;
	var _this = this;

	this.movement = new goo.Vector2();
	this.delta = new goo.Vector2();
	this.old = new goo.Vector2();
	this.position = new goo.Vector2();
	
	this.getButton = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		return buttons[btn];
	};
	
	this.bind = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		buttons[btn] = false;
		if(callback){
			if(typeof callback === 'function'){
				goo.SystemBus.addListener("MouseInput"+btn, callback);
			}
		}
		return this;
	};
	
	this.unbind = function(btnCode, callback){
		if(null === callback){
			console.warn("MouseInput.unbind: You should pass in the callback to remove, did you mean 'MouseInput.unbindAll ?");
			this.unbindAll(btnCode);
			return this;
		}
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		if(undefined !== buttons[btn]){
			if(typeof callback === 'function'){
				goo.SystemBus.removeListener("MouseInput"+btn, callback);
			}
		}
		return this;
	};
	
	this.unbindAll = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		goo.SystemBus.removeAllOnChannel("MouseInput"+btn);
		return this;
	};
	
	function mouseWheel(e){
		e = e || window.event;
		var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		goo.SystemBus.emit("MouseInput8", wheelDelta);
	}
	
	function mouseDown(e){
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
		if(true === buttons[btn]){return;}
		buttons[btn] = true;
		goo.SystemBus.emit("MouseInput"+btn, true);
	}
	function mouseUp(e){
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
		if(false === buttons[btn]){return;}
		buttons[btn] = false;
		goo.SystemBus.emit("MouseInput"+btn, false);
	}
	function mouseMove(e){
		updateMousePos(e);
		goo.SystemBus.emit("MouseInput16", false);
	}
	function updateMousePos(e){
		e = e || window.event;
		if (e && e.preventDefault) {e.preventDefault();}
		if (e && e.stopPropagation) {e.stopPropagation();}

		var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
			(document.body.scrollLeft - document.documentElement.clientLeft);

		var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
			(document.body.scrollTop - document.documentElement.scrollTop);
		newX -= (offsetLeft + ctx.domElement.offsetLeft);
		newY -= (offsetTop + ctx.domElement.offsetTop);
		_this.movement.x = e.movementX;
		_this.movement.y = e.movementY;
		_this.delta.x = newX - _this.position.x;
		_this.delta.y = newY - _this.position.y;
		_this.old.x = _this.position.x;
		_this.old.y = _this.position.y;
		_this.position.x = newX;
		_this.position.y = newY;
	}

	document.documentElement.addEventListener('mousedown', mouseDown, false);
	document.documentElement.addEventListener('mouseup', mouseUp, false);
	document.documentElement.addEventListener('mousemove', mouseMove, false);
	document.documentElement.addEventListener("mousewheel", mouseWheel, false);
	document.documentElement.addEventListener("DOMMouseScroll", mouseWheel, false); // Firefox

	/* Implement this method to do cleanup on script stop and delete */
	this.cleanup = function(args, ctx, goo) {
		for(var i in buttons){
			goo.SystemBus.removeAllOnChannel("MouseInput"+i);
		}
		document.documentElement.removeEventListener('mousemove', mouseMove, false);
		document.documentElement.removeEventListener('mousedown', mouseDown, false);
		document.documentElement.removeEventListener('mouseup', mouseUp, false);
		document.documentElement.removeEventListener("mousewheel", mouseWheel, false);
		document.documentElement.removeEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
		delete ctx.worldData.MouseInput;
	}
}
