'use strict';
(function(window, document, undefined){
	var eventList = {};
	var buttons = {};
	var stringToCode = {"Left":1, "Right":2, "Middle":4, "Wheel":8, "Move":16};
	var domElement = undefined;
	
	var MouseInput = {};
	MouseInput.ready = false;
	MouseInput.setup = function(ctx, goo){
		domElement = ctx.domElement;
		MouseInput.movement = new goo.Vector3();
		MouseInput.old = new goo.Vector3();
		MouseInput.position = new goo.Vector3();
		MouseInput.wheelDelta = 0;
		
		document.addEventListener("contextmenu", contextMenu, false);
		document.documentElement.addEventListener('mousedown', mouseDown, false);
		document.documentElement.addEventListener('mouseup', mouseUp, false);
		document.documentElement.addEventListener('mousemove', mouseMove, false);
		ctx.domElement.addEventListener("mousewheel", mouseWheel, false);
		ctx.domElement.addEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
		MouseInput.ready = true;
	};
	MouseInput.cleanup = function(ctx) {
		for(var i in buttons){
			if(buttons.hasOwnProperty(i)){
				MouseInput.off(Number(i));
			}
		}
		document.removeEventListener("contextmenu", contextMenu, false);
		document.documentElement.removeEventListener('mousemove', mouseMove, false);
		document.documentElement.removeEventListener('mousedown', mouseDown, false);
		document.documentElement.removeEventListener('mouseup', mouseUp, false);
		ctx.domElement.removeEventListener("mousewheel", mouseWheel, false);
		ctx.domElement.removeEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
		MouseInput.ready = false;
	};
	MouseInput.getButton = function(btnCode){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		return buttons[btn];
	}
	MouseInput.on = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		buttons[btn] = false;
		if(callback){
			if(typeof callback === 'function'){
				if(!eventList["MouseInput"+btn]){
					eventList["MouseInput"+btn] = {first:null, last:null};
				}
				var node = {previous:null, next:null, callback:callback};
				if(null === eventList["MouseInput"+btn].first){
					eventList["MouseInput"+btn].first = node;
					eventList["MouseInput"+btn].last = node;
				}
				else{
					node.next = eventList["MouseInput"+btn].first;
					eventList["MouseInput"+btn].first.previous = node;
					eventList["MouseInput"+btn].first = node;
				}
					
			}
		}
		return MouseInput;
	};
	MouseInput.off = function(btnCode, callback){
		var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
		if(undefined === callback){
			if(eventList["MouseInput"+btn]){
				while(null !== eventList["MouseInput"+btn].first){
					var node = eventList["MouseInput"+btn].first;
					eventList["MouseInput"+btn].first = node.next;
					node.previous = null;
					node.next = null;
				}
				eventList["MouseInput"+btn].last = null;
				delete eventList["MouseInput"+btn];
			}
			return MouseInput;
		}
		if(undefined !== buttons[btn]){
			if(typeof callback === 'function'){
				var node = eventList["MouseInput"+btn].first;
				while(node != null){
					if(node.callback === callback){
						break;
					}
					node = node.next;
				}
				if(node !== null){
					if(eventList["MouseInput"+btn].first === node){
						eventList["MouseInput"+btn].first = eventList["MouseInput"+btn].first.next;
					}
					if(eventList["MouseInput"+btn].last === node){
						eventList["MouseInput"+btn].last = eventList["MouseInput"+btn].last.previous;
					}
					if(node.previous !== null){
						node.previous.next = node.next;
					}
					if(node.next !== null ){
						node.next.previous = node.previous;
					}
				}
				if(null === eventList["MouseInput"+btn].first){
					delete eventList["MouseInput"];
				}
			}
		}
		return MouseInput;
	};
	var mouseWheel = function(e){
		e = e || window.event;
		e.stopPropagation ? e.stopPropagation : e.cancelBubble = true;
		var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
		MouseInput.wheelDelta = wheelDelta;
		if(eventList["MouseInput8"]){
			var node = eventList["MouseInput8"].first;
			while(node !== null){
				node.callback(wheelDelta);
				node = node.next;
			}
		}
	};
	var contextMenu = function(e){
		e = e || window.event;
		if(e.preventDefault){e.preventDefault();}
		e.stopPropagation ? e.stopPropagation : e.cancelBubble = true;
		return false;
	}
	var mouseDown = function(e){
		e = e || window.event;
		e.stopPropagation ? e.stopPropagation : e.cancelBubble = true;
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
		if(eventList["MouseInput"+btn]){
			var node = eventList["MouseInput"+btn].first;
			while(node !== null){
				node.callback(true);
				node = node.next;
			}
		}
	};
	var mouseUp = function(e){
		e = e || window.event;
		e.stopPropagation ? e.stopPropagation : e.cancelBubble = true;
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
		if(eventList["MouseInput"+btn]){
			var node = eventList["MouseInput"+btn].first;
			while(node !== null){
				node.callback(false);
				node = node.next;
			}
		}
	};
	var mouseMove = function(e){
		e = e || window.event;
		e.stopPropagation ? e.stopPropagation : e.cancelBubble = true;
		updateMousePos(e);
		if(eventList["MouseInput16"]){
			var node = eventList["MouseInput16"].first;
			while(node !== null){
				node.callback();
				node = node.next;
			}
		}
	};
	var updateMousePos = function(e){
		var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
			(document.body.scrollLeft - document.documentElement.clientLeft);

		var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
			(document.body.scrollTop - document.documentElement.scrollTop);

		newX -= (domElement.getBoundingClientRect().left + domElement.offsetLeft);
		newY -= (domElement.getBoundingClientRect().top + domElement.offsetTop);
		
		MouseInput.movement.x = e.movementX;
		MouseInput.movement.y = e.movementY;
		//MouseInput.delta.x = newX - MouseInput.position.x;
		//MouseInput.delta.y = newY - MouseInput.position.y;
		MouseInput.old.x = MouseInput.position.x;
		MouseInput.old.y = MouseInput.position.y;
		MouseInput.position.x = newX;
		MouseInput.position.y = newY;
	};
	
	var global = global || window;
	global.MouseInput = MouseInput;
}(window, document));
