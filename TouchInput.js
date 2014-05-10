var TouchInput = (function(){
	return{
		setup:function(args, ctx, goo){
			var offsetLeft = ctx.domElement.getBoundingClientRect().left;
			var offsetTop = ctx.domElement.getBoundingClientRect().top;
			var touches = {};
			var touchTypes = {TouchStart:0, TouchMove:1, TouchEnd:2, TouchCancel:3};
			TouchInput.touches = touches;
			//Object.freeze(TouchInput.touches);
			TouchInput.bind = function(touchEvent, callback){
				if(touchTypes[touchEvent] === undefined){
					console.warn("TouchInput.bind: Unrecognized touchEvent.");
					console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
				}
				else{
					if(callback){
						if(typeof callback === 'function'){
							goo.SystemBus.addListener(touchEvent, callback);
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
							goo.SystemBus.removeListener(touchEvent, callback);
						}
					}
				}
				else{
					console.warn("TouchInput.unbind: You should pass in the callback to remove, did you mean 'TouchInput.unbindAll ?");
					TouchInput.unbindAll(touchEvent);
				}
				return TouchInput;
			};
			TouchInput.unbindAll = function(){
				if(touchTypes[touchEvent] === undefined){
					console.warn("TouchInput.unbind: Unrecognized touchEvent.");
					console.warn(" ~ touchEvents are 'TouchStart', 'TouchMove', 'TouchEnd', 'TouchCancel'.");
				}
				else{
				}
				return TouchInput;
			};
			
			function touchStart(e){
				e = e || window.event;
				if (e && e.preventDefault) {e.preventDefault();}
				if (e && e.stopPropagation) {e.stopPropagation();}
				if(e.target !== ctx.domElement){return;}
				console.log("touchStart");
				for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
					if(undefined === touches[e.changedTouches[i].identifier]){
						touches[e.changedTouches[i].identifier] = {
							id:e.changedTouches[i].identifier,
							position:new goo.Vector2(),
							delta:new goo.Vector2(),
							time:ctx.world.time,
							old:new goo.Vector2()};
						updateTouchPos(e.changedTouches[i]);
						touches[e.changedTouches[i].identifier].delta.copy(goo.Vector2.ZERO);	
						touches[e.changedTouches[i].identifier].old.copy(touches[e.changedTouches[i].identifier].position);
					}
					else{
						updateTouchPos(e.changedTouches[i]);
					}
					goo.SystemBus.emit("TouchStart", touches[e.changedTouches[i].identifier]);
				}
			}
			function touchMove(e){
				e = e || window.event;
				if (e && e.preventDefault) {e.preventDefault();}
				if (e && e.stopPropagation) {e.stopPropagation();}
				if(e.target !== ctx.domElement){return;}
				console.log("touchMove");
				for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
					updateTouchPos(e.changedTouches[i]);
					goo.SystemBus.emit("TouchMove", touches[e.changedTouches[i].identifier]);
				}
			}
			function touchEnd(e){
				e = e || window.event;
				if (e && e.preventDefault) {e.preventDefault();}
				if (e && e.stopPropagation) {e.stopPropagation();}
				if(e.target !== ctx.domElement){return;}
				console.log("touchEnd");
				for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
					updateTouchPos(e.changedTouches[i]);
					goo.SystemBus.emit("TouchEnd", touches[e.changedTouches[i].identifier]);
				}
			}
			function touchCancel(e){
				e = e || window.event;
				if (e && e.preventDefault) {e.preventDefault();}
				if (e && e.stopPropagation) {e.stopPropagation();}
				if(e.target !== ctx.domElement){return;}
				console.log("touchCancel");
				for(var i = 0, ilen = e.changedTouches.length; i < ilen; i++){
					updateTouchPos(e.changedTouches[i]);
					goo.SystemBus.emit("TouchCancel", touches[e.changedTouches[i].identifier]);
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
				ctx.domElement.removeEventListener("touchstart", touchStart, false);
				ctx.domElement.removeEventListener("touchmove", touchMove, false);
				ctx.domElement.removeEventListener("touchend", touchEnd, false);
				ctx.domElement.removeEventListener("touchcancel", touchCancel, false);
				touches = {};
				delete TouchInput.bind;
				delete TouchInput.unbind;
				delete TouchInput.unbindAll;
				delete TouchInput.touches;
				delete TouchInput.cleanup;
			}
			
			ctx.domElement.addEventListener("touchstart", touchStart, false);
			ctx.domElement.addEventListener("touchmove", touchMove, false);
			ctx.domElement.addEventListener("touchend", touchEnd, false);
			ctx.domElement.addEventListener("touchcancel", touchCancel, false);
		}
	}
})();
