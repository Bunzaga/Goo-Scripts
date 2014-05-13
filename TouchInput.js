"use strict";
(function(window, document, undefined){
	var TouchInput = {};
	TouchInput.setup = function(args, ctx, goo){
		var offsetLeft = ctx.domElement.getBoundingClientRect().left;
		var offsetTop = ctx.domElement.getBoundingClientRect().top;
		var touches = {};
		var touchTypes = {TouchStart:0, TouchMove:1, TouchEnd:2, TouchCancel:3};
		var eventList = {};
		TouchInput.touches = touches;
		TouchInput.bind = function(touchEvent, callback){
			if(touchTypes[touchEvent] === undefined){
				console.warn("TouchInput.bind: Unrecognized touchEvent.");
				console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
			}
			else{
				if(callback){
					if(typeof callback === 'function'){
						if(undefined === eventList[touchEvent]){
							eventList[touchEvent] = {first:null, last:null};
						}
						var node = {previous:null, next:null, callback:callback};
						if(null === eventList[touchEvent].first){
							eventList[touchEvent].first = node;
							eventList[touchEvent].last = node;
						}
						else{
							node.next = eventList[touchEvent].first;
							eventList[touchEvent].first.previous = node;
							eventList[touchEvent].first = node;
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
				if(touchTypes[touchEvent] === undefined){
					console.warn("TouchInput.unbind: Unrecognized touchEvent.");
					console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
				}
				else{
					if(typeof callback === 'function'){
						if(eventList[touchEvent]){
							var node = eventList[touchEvent].first;
							while(node != null){
								if(node.callback === callback){
									break;
								}
								node = node.next;
							}
							if(node !== null){
								if(eventList[touchEvent].first === node){
									eventList[touchEvent].first = eventList[touchEvent].first.next;
								}
								if(eventList[touchEvent].last === node){
									eventList[touchEvent].last = eventList[touchEvent].last.previous;
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
				}
			}
			else{
				console.warn("TouchInput.unbind: You should pass in the callback to remove, did you mean 'TouchInput.unbindAll ?");
				TouchInput.unbindAll(touchEvent);
			}
			return TouchInput;
		};
		TouchInput.unbindAll = function(touchEvent){
			if(touchTypes[touchEvent] === undefined){
				console.warn("TouchInput.unbind: Unrecognized touchEvent.");
				console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
			}
			else{
				if(eventList[touchEvent]){
					while(null !== eventList[touchEvent].first){
						var node = eventList[touchEvent].first;
						eventList[touchEvent].first = node.next;
						node.previous = null;
						node.next = null;
					}
					eventList[touchEvent].last = null;
				}
			}
			return TouchInput;
		};
		
		function touchStart(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				if(undefined === touches[e.changedTouches[i].identifier]){
					touches[e.changedTouches[i].identifier] = {
						position:new goo.Vector2(),
						delta:new goo.Vector2(),
						time:0.0,
						old:new goo.Vector2()
					};
				}

				touches[e.changedTouches[i].identifier].id = e.changedTouches[i].identifier;
				updateTouchPos(e.changedTouches[i]);
				touches[e.changedTouches[i].identifier].delta.copy(goo.Vector2.ZERO);	
				touches[e.changedTouches[i].identifier].old.copy(touches[e.changedTouches[i].identifier].position);
				var node = eventList["TouchStart"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		function touchMove(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				updateTouchPos(e.changedTouches[i]);
				var node = eventList["TouchMove"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		function touchEnd(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				updateTouchPos(e.changedTouches[i]);
				var node = eventList["TouchEnd"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		function touchCancel(e){
			e = e || window.event;
			if (e && e.preventDefault) {e.preventDefault();}
			if (e && e.stopPropagation) {e.stopPropagation();}
			for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
				updateTouchPos(e.changedTouches[i]);
				var node = eventList["TouchCancel"].first;
				while(node !== null){
					node.callback(touches[e.changedTouches[i].identifier]);
					node = node.next;
				}
			}
		}
		
		function updateTouchPos(e){
			var newX = e.pageX ? e.pageX : e.clientX + (document.documentElement.scrollLeft) ||
				(document.body.scrollLeft - document.documentElement.clientLeft);

			var newY = e.pageY ? e.pageY : e.clientY + (document.documentElement.scrollTop) ||
				(document.body.scrollTop - document.documentElement.scrollTop);

			newX -= (offsetLeft + ctx.domElement.offsetLeft);
			newY -= (offsetTop + ctx.domElement.offsetTop);
			touches[e.identifier].delta.x = newX - touches[e.identifier].position.x;
			touches[e.identifier].delta.y = newY - touches[e.identifier].position.y;
			touches[e.identifier].old.x = touches[e.identifier].position.x;
			touches[e.identifier].old.y = touches[e.identifier].position.y;
			touches[e.identifier].position.x = newX;
			touches[e.identifier].position.y = newY;
			touches[e.identifier].time = ctx.world.time;
		}
		
		TouchInput.cleanup = function(){
			for(var i in touchTypes){
				TouchInput.unbindAll(i);
			}
			ctx.domElement.removeEventListener("touchstart", touchStart, false);
			ctx.domElement.removeEventListener("touchmove", touchMove, false);
			ctx.domElement.removeEventListener("touchend", touchEnd, false);
			ctx.domElement.removeEventListener("touchcancel", touchCancel, false);
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
		ctx.domElement.addEventListener("touchstart", touchStart, false);
		ctx.domElement.addEventListener("touchmove", touchMove, false);
		ctx.domElement.addEventListener("touchend", touchEnd, false);
		ctx.domElement.addEventListener("touchcancel", touchCancel, false);
	}
	var global = global || window;
	global.TouchInput = TouchInput;
}(window, document));
