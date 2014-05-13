'use strict';
(function(window, document, undefined){
	var MouseInput = {};
	MouseInput.setup = function(args, ctx, goo){
		var buttons = {};
		var stringToCode = {"left":1, "right":2, "middle":4, "wheel":8, "move":16};
		var offsetLeft = ctx.domElement.getBoundingClientRect().left;
		var offsetTop = ctx.domElement.getBoundingClientRect().top;
		var eventList = {};

		MouseInput.movement = new goo.Vector2();
		MouseInput.delta = new goo.Vector2();
		MouseInput.old = new goo.Vector2();
		MouseInput.position = new goo.Vector2();
		MouseInput.wheelDelta = 0;
		MouseInput.getButton = function(btnCode){
			var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
			return buttons[btn];
		}
		MouseInput.bind = function(btnCode, callback){
			var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
			buttons[btn] = false;
			if(callback){
				if(typeof callback === 'function'){
					//goo.SystemBus.addListener("MouseInput"+btn, callback);
					if(undefined === eventList["MouseInput"+btn]){
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
		MouseInput.unbind = function(btnCode, callback){
			if(null === callback){
				console.warn("MouseInput.unbind: You should pass in the callback to remove, did you mean 'MouseInput.unbindAll ?");
				MouseInput.unbindAll(btnCode);
				return MouseInput;
			}
			var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
			if(undefined !== buttons[btn]){
				if(typeof callback === 'function'){
					//goo.SystemBus.removeListener("MouseInput"+btn, callback);
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
				}
			}
			return MouseInput;
		};
		MouseInput.unbindAll = function(btnCode){
			var btn = typeof btnCode === 'number' ? btnCode : stringToCode[btnCode];
			//goo.SystemBus.removeAllOnChannel("MouseInput"+btn);
			if(eventList["MouseInput"+btn]){
				while(null !== eventList["MouseInput"+btn].first){
					var node = eventList["MouseInput"+btn].first;
					eventList["MouseInput"+btn].first = node.next;
					node.previous = null;
					node.next = null;
				}
				eventList["MouseInput"+btn].last = null;
			}
			return MouseInput;
		};
		function mouseWheel(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			MouseInput.wheelDelta = wheelDelta;
			//goo.SystemBus.emit("MouseInput8", wheelDelta);
			if(eventList["MouseInput8"]){
				var node = eventList["MouseInput8"].first;
				while(node !== null){
					node.callback(wheelDelta);
					node = node.next;
				}
			}
		}
		function mouseDown(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
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
			//goo.SystemBus.emit("MouseInput"+btn, true);
			if(eventList["MouseInput"+btn]){
				var node = eventList["MouseInput"+btn].first;
				while(node !== null){
					node.callback(true);
					node = node.next;
				}
			}
		}
		function mouseUp(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
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
			//goo.SystemBus.emit("MouseInput"+btn, false);
			if(eventList["MouseInput"+btn]){
				var node = eventList["MouseInput"+btn].first;
				while(node !== null){
					node.callback(false);
					node = node.next;
				}
			}
		}
		function mouseMove(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			updateMousePos(e);
			//goo.SystemBus.emit("MouseInput16", false);
			if(eventList["MouseInput16"]){
				var node = eventList["MouseInput16"].first;
				while(node !== null){
					node.callback();
					node = node.next;
				}
			}
		}
		function updateMousePos(e){
			var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
				(document.body.scrollLeft - document.documentElement.clientLeft);

			var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
				(document.body.scrollTop - document.documentElement.scrollTop);

			newX -= (offsetLeft + ctx.domElement.offsetLeft);
			newY -= (offsetTop + ctx.domElement.offsetTop);
			MouseInput.movement.x = e.movementX;
			MouseInput.movement.y = e.movementY;
			MouseInput.delta.x = newX - MouseInput.position.x;
			MouseInput.delta.y = newY - MouseInput.position.y;
			MouseInput.old.x = MouseInput.position.x;
			MouseInput.old.y = MouseInput.position.y;
			MouseInput.position.x = newX;
			MouseInput.position.y = newY;
		}

		document.documentElement.addEventListener('mousedown', mouseDown, false);
		document.documentElement.addEventListener('mouseup', mouseUp, false);
		document.documentElement.addEventListener('mousemove', mouseMove, false);
		document.documentElement.addEventListener("mousewheel", mouseWheel, false);
		document.documentElement.addEventListener("DOMMouseScroll", mouseWheel, false); // Firefox

		MouseInput.cleanup = function() {
			for(var i in buttons){
				MouseInput.unbindAll("MouseInput"+i);
			}
			document.documentElement.removeEventListener('mousemove', mouseMove, false);
			document.documentElement.removeEventListener('mousedown', mouseDown, false);
			document.documentElement.removeEventListener('mouseup', mouseUp, false);
			document.documentElement.removeEventListener("mousewheel", mouseWheel, false);
			document.documentElement.removeEventListener("DOMMouseScroll", mouseWheel, false); // Firefox
			delete MouseInput.getButton;
			delete MouseInput.bind;
			delete MouseInput.unbind;
			delete MouseInput.unbindAll;
			delete MouseInput.cleanup;
			delete MouseInput.movement;
			delete MouseInput.delta;
			delete MouseInput.old;
			delete MouseInput.position;
			delete MouseInput.wheelDelta;
		}
	};
	var global = global || window;
	global.MouseInput = MouseInput;
})(window, document);
