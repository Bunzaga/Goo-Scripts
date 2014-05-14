"use strict";
(function(window, document, undefined){
	var TouchInput = {};
	TouchInput.setup = function(args, ctx, goo){
		ctx.offsetLeft = ctx.domElement.getBoundingClientRect().left;
		ctx.offsetTop = ctx.domElement.getBoundingClientRect().top;
		ctx.touches = {};
		ctx.touchTypes = {TouchStart:0, TouchMove:1, TouchEnd:2, TouchCancel:3};
		ctx.eventList = {};
		TouchInput.touches = touches;
		TouchInput.bind = function(touchEvent, callback){
			if(ctx.touchTypes[touchEvent] === undefined){
				console.warn("TouchInput.bind: Unrecognized touchEvent.");
				console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
			}
			else{
				if(callback){
					if(typeof callback === 'function'){
						if(!ctx.eventList[touchEvent]){
							ctx.eventList[touchEvent] = {first:null, last:null};
						}
						var node = {previous:null, next:null, callback:callback};
						if(null === ctx.eventList[touchEvent].first){
							ctx.eventList[touchEvent].first = node;
							ctx.eventList[touchEvent].last = node;
						}
						else{
							node.next = ctx.eventList[touchEvent].first;
							ctx.eventList[touchEvent].first.previous = node;
							ctx.eventList[touchEvent].first = node;
						}
						
					}
				}
				else{
					console.warn("TouchInput.bind: You must pass in a callback function as the secod argument.");
				}
			}
			return TouchInput;
		};
		TouchInput.unbind = function(touchEvent, callback){
			if(callback){
				if(ctx.touchTypes[touchEvent] === undefined){
					console.warn("TouchInput.unbind: Unrecognized touchEvent.");
					console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
				}
				else{
					if(typeof callback === 'function'){
						if(ctx.eventList[touchEvent]){
							var node = ctx.eventList[touchEvent].first;
							while(node != null){
								if(node.callback === callback){
									break;
								}
								node = node.next;
							}
							if(node !== null){
								if(ctx.eventList[touchEvent].first === node){
									ctx.eventList[touchEvent].first = ctx.eventList[touchEvent].first.next;
								}
								if(ctx.eventList[touchEvent].last === node){
									ctx.eventList[touchEvent].last = ctx.eventList[touchEvent].last.previous;
								}
								if(node.previous !== null){
									node.previous.next = node.next;
								}
								if(node.next !== null ){
									node.next.previous = node.previous;
								}
							}
							if(null === ctx.eventList[touchEvent].first){
								delete ctx.eventList[touchEvent];
							}
						}
					}
				}
			}
			else{
				console.warn("TouchInput.unbind: You should pass in the callback to remove, did you mean 'TouchInput.unbindAll ?");
				TouchInput.unbindAll(touchEvent);
			}
			return TouchInput;
		};
		TouchInput.unbindAll = function(touchEvent){
			if(ctx.touchTypes[touchEvent] === undefined){
				console.warn("TouchInput.unbind: Unrecognized touchEvent.");
				console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
			}
			else{
				if(ctx.eventList[touchEvent]){
					while(null !== ctx.eventList[touchEvent].first){
						var node = ctx.eventList[touchEvent].first;
						ctx.eventList[touchEvent].first = node.next;
						node.previous = null;
						node.next = null;
					}
					ctx.eventList[touchEvent].last = null;
					delete ctx.eventList[touchEvent];
				}
			}
			return TouchInput;
		};
		
		ctx.touchStart = function(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				if(undefined === ctx.touches[e.changedTouches[i].identifier]){
					ctx.touches[e.changedTouches[i].identifier] = {
						position:new goo.Vector2(),
						delta:new goo.Vector2(),
						time:0.0,
						old:new goo.Vector2()
					};
				}

				ctx.touches[e.changedTouches[i].identifier].id = e.changedTouches[i].identifier;
				ctx.updateTouchPos(e.changedTouches[i]);
				ctx.touches[e.changedTouches[i].identifier].delta.copy(goo.Vector2.ZERO);	
				ctx.touches[e.changedTouches[i].identifier].old.copy(ctx.touches[e.changedTouches[i].identifier].position);
				var node = ctx.eventList["TouchStart"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		ctx.touchMove = function(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				ctx.updateTouchPos(e.changedTouches[i]);
				var node = ctx.eventList["TouchMove"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		ctx.touchEnd = function(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				ctx.updateTouchPos(e.changedTouches[i]);
				var node = ctx.eventList["TouchEnd"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		ctx.touchCancel = function(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				ctx.updateTouchPos(e.changedTouches[i]);
				var node = ctx.eventList["TouchCancel"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		
		ctx.updateTouchPos = function(e){
			var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
				(document.body.scrollLeft - document.documentElement.clientLeft);

			var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
				(document.body.scrollTop - document.documentElement.scrollTop);

			newX -= (ctx.offsetLeft + ctx.domElement.offsetLeft);
			newY -= (ctx.offsetTop + ctx.domElement.offsetTop);
			ctx.touches[e.identifier].delta.x = newX - ctx.touches[e.identifier].position.x;
			ctx.touches[e.identifier].delta.y = newY - ctx.touches[e.identifier].position.y;
			ctx.touches[e.identifier].old.x = ctx.touches[e.identifier].position.x;
			ctx.touches[e.identifier].old.y = ctx.touches[e.identifier].position.y;
			ctx.touches[e.identifier].position.x = newX;
			ctx.touches[e.identifier].position.y = newY;
			ctx.touches[e.identifier].time = ctx.world.time;
		}
		
		TouchInput.cleanup = function(){
			for(var i in ctx.touchTypes){
				TouchInput.unbindAll(""+i);
			}
			ctx.domElement.removeEventListener("touchstart", ctx.touchStart, false);
			ctx.domElement.removeEventListener("touchmove", ctx.touchMove, false);
			ctx.domElement.removeEventListener("touchend", ctx.touchEnd, false);
			ctx.domElement.removeEventListener("touchcancel", ctx.touchCancel, false);
			delete TouchInput.bind;
			delete TouchInput.unbind;
			delete TouchInput.unbindAll;
			delete TouchInput.touches;
			delete TouchInput.cleanup;
		}
		document.body.addEventListener('touchstart', function(e) {e.preventDefault();}, false);
		document.body.addEventListener('touchmove', function(e) {e.preventDefault();}, false);
		document.body.addEventListener('touchend', function(e) {e.preventDefault();}, false);
		document.body.addEventListener("touchcancel", function(e) {e.preventDefault();}, false);
		ctx.domElement.addEventListener("touchstart", ctx.touchStart, false);
		ctx.domElement.addEventListener("touchmove", ctx.touchMove, false);
		ctx.domElement.addEventListener("touchend", ctx.touchEnd, false);
		ctx.domElement.addEventListener("touchcancel", ctx.touchCancel, false);
	}
	var global = global || window;
	global.TouchInput = TouchInput;
}(window, document));
