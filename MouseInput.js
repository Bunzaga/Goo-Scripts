'use strict';
(function(window, document, undefined){
	var MouseInput = {};
	MouseInput.setup = function(args, ctx, goo){
		ctx.buttons = {};
		ctx.stringToCode = {"left":1, "right":2, "middle":4, "wheel":8, "move":16};
		ctx.offsetLeft = ctx.domElement.getBoundingClientRect().left;
		ctx.offsetTop = ctx.domElement.getBoundingClientRect().top;
		ctx.eventList = {};

		MouseInput.movement = new goo.Vector2();
		MouseInput.delta = new goo.Vector2();
		MouseInput.old = new goo.Vector2();
		MouseInput.position = new goo.Vector2();
		MouseInput.wheelDelta = 0;
		MouseInput.getButton = function(btnCode){
			var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
			return ctx.buttons[btn];
		}
		MouseInput.bind = function(btnCode, callback){
			var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
			ctx.buttons[btn] = false;
			if(callback){
				if(typeof callback === 'function'){
					if(!ctx.eventList["MouseInput"+btn]){
						ctx.eventList["MouseInput"+btn] = {first:null, last:null};
					}
					var node = {previous:null, next:null, callback:callback};
					if(null === ctx.eventList["MouseInput"+btn].first){
						ctx.eventList["MouseInput"+btn].first = node;
						ctx.eventList["MouseInput"+btn].last = node;
					}
					else{
						node.next = ctx.eventList["MouseInput"+btn].first;
						ctx.eventList["MouseInput"+btn].first.previous = node;
						ctx.eventList["MouseInput"+btn].first = node;
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
			var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
			if(undefined !== ctx.buttons[btn]){
				if(typeof callback === 'function'){
					var node = ctx.eventList["MouseInput"+btn].first;
					while(node != null){
						if(node.callback === callback){
							break;
						}
						node = node.next;
					}
					if(node !== null){
						if(ctx.eventList["MouseInput"+btn].first === node){
							ctx.eventList["MouseInput"+btn].first = ctx.eventList["MouseInput"+btn].first.next;
						}
						if(eventList["MouseInput"+btn].last === node){
							ctx.eventList["MouseInput"+btn].last = ctx.eventList["MouseInput"+btn].last.previous;
						}
						if(node.previous !== null){
							node.previous.next = node.next;
						}
						if(node.next !== null ){
							node.next.previous = node.previous;
						}
					}
					if(null === ctx.eventList["MouseInput"+btn].first){
						delete ctx.eventList["MouseInput"];
					}
				}
			}
			return MouseInput;
		};
		MouseInput.unbindAll = function(btnCode){
			var btn = typeof btnCode === 'number' ? btnCode : ctx.stringToCode[btnCode];
			if(ctx.eventList["MouseInput"+btn]){
				while(null !== ctx.eventList["MouseInput"+btn].first){
					var node = ctx.eventList["MouseInput"+btn].first;
					ctx.eventList["MouseInput"+btn].first = node.next;
					node.previous = null;
					node.next = null;
				}
				ctx.eventList["MouseInput"+btn].last = null;
				delete ctx.eventList["MouseInput"+btn];
			}
			return MouseInput;
		};
		function mouseWheel(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			var wheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			MouseInput.wheelDelta = wheelDelta;
			if(ctx.eventList["MouseInput8"]){
				var node = ctx.eventList["MouseInput8"].first;
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
			if(true === ctx.buttons[btn]){return;}
			ctx.buttons[btn] = true;
			if(ctx.eventList["MouseInput"+btn]){
				var node = ctx.eventList["MouseInput"+btn].first;
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
			if(false === ctx.buttons[btn]){return;}
			ctx.buttons[btn] = false;
			if(ctx.eventList["MouseInput"+btn]){
				var node = ctx.eventList["MouseInput"+btn].first;
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
			ctx.updateMousePos(e);
			if(ctx.eventList["MouseInput16"]){
				var node = ctx.eventList["MouseInput16"].first;
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

		document.documentElement.addEventListener('mousedown', ctx.mouseDown, false);
		document.documentElement.addEventListener('mouseup', ctx.mouseUp, false);
		document.documentElement.addEventListener('mousemove', ctx.mouseMove, false);
		document.documentElement.addEventListener("mousewheel", ctx.mouseWheel, false);
		document.documentElement.addEventListener("DOMMouseScroll", ctx.mouseWheel, false); // Firefox

		MouseInput.cleanup = function() {
			for(var i in buttons){
				MouseInput.unbindAll(Number(i));
			}
			document.documentElement.removeEventListener('mousemove', ctx.mouseMove, false);
			document.documentElement.removeEventListener('mousedown', ctx.mouseDown, false);
			document.documentElement.removeEventListener('mouseup', ctx.mouseUp, false);
			document.documentElement.removeEventListener("mousewheel", ctx.mouseWheel, false);
			document.documentElement.removeEventListener("DOMMouseScroll", ctx.mouseWheel, false); // Firefox
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
}(window, document));
