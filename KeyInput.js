(function(window, document, undefined){
	var KeyInput = {};
	KeyInput.setup = function(args, ctx, goo){
		var keys = {};
		var stringToCode = {"backspace":8,"tab":9,"enter":13,"shift":16,"ctrl":17,"alt":18,"pause":19,"caps":20,"esc":27,"escape":27,"space":32,"page up":33,"page down":34,"end":35,"home":36,"left":37,"up":38,"right":39,"down":40,"insert":45,"delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,"a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,"j":74,"k":75,"l":76,"m":77,"n":78,"o":79,"p":80,"q":81,"r":82,"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90,"windows":91,"right click":93,"num0":96,"num1":97,"num2":98,"num3":99,"num4":100,"num5":101,"num6":102,"num7":103,"num8":104,"num9":105,"num*":106,"num+":107,"num-":109,"num.":110,"num/":111,"f1":112,"f2":113,"f3":114,"f4":115,"f5":116,"f6":117,"f7":118,"f8":119,"f9":120,"f10":121,"f11":122,"f12":123,"num lock":144,"scroll lock":145,"my computer":182,"my calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};
		var eventList = {};
		KeyInput.getKey = function(keyCode){
			var key = typeof keyCode === 'number' ? keyCode : stringToCode[""+keyCode];
			return keys[key];
		};
		KeyInput.setKey = function(keyCode, bool){
			var key = typeof keyCode === 'number' ? keyCode : stringToCode[""+keyCode];
			if(undefined === keys[key]){return KeyInput;}
			if(bool !== true && bool !== false){
				console.warn("KeyInput.setKey: You must pass in a boolean value as the second parameter.");
				return;
			}
			if(bool === keys[key]){return;}
			keys[key] = bool;
			goo.SystemBus.emit("Key"+key, bool);
			return KeyInput;
		};
		KeyInput.bind = function(keyCode, callback){
			var key = typeof keyCode === 'number' ? keyCode : stringToCode[""+keyCode];
			keys[key] = false;
			if(callback){
				if(typeof callback === 'function'){
					if(undefined === eventList["Key"+key]){
						eventList["Key"+key] = {first:null, last:null};
					}
					var node = {previous:null, next:null, callback:callback};
					if(null === eventList["Key"+key].first){
						eventList["Key"+key].first = node;
						eventList["Key"+key].last = node;
					}
					else{
						node.next = eventList["Key"+key].first;
						eventList["Key"+key].first.previous = node;
						eventList["Key"+key].first = node;
					}
				}
			}
			return KeyInput;
		};
		KeyInput.unbind = function(keyCode, callback){
			if(undefined === callback){
				console.warn("KeyInput.unbind: You should pass in the callback to remove, did you mean 'KeyInput.unbindAll?");
				KeyInput.unbindAll(keyCode);
				return KeyInput;
			}
			var key = typeof keyCode === 'number' ? keyCode : stringToCode[""+keyCode];
			var node = eventList["Key"+key].first;
				while(node != null){
					if(node.callback === callback){
						break;
					}
					node = node.next;
				}
				if(node !== null){
					if(eventList["Key"+key].first === node){
						eventList["Key"+key].first = eventList["Key"+key].first.next;
					}
					if(eventList["Key"+key].last === node){
						eventList["Key"+key].last = eventList["Key"+key].last.previous;
					}
					if(node.previous !== null){
						node.previous.next = node.next;
					}
					if(node.next !== null ){
						node.next.previous = node.previous;
					}
				}
			return KeyInput;
		};
		KeyInput.unbindAll = function(keyCode){
			var key = typeof keyCode === 'number' ? keyCode : stringToCode[""+keyCode];
			if(eventList["Key"+key]){
				while(null !== eventList["Key"+key].first){
					var node = eventList["Key"+key].first;
					eventList["Key"+key].first = node.next;
					node.previous = null;
					node.next = null;
				}
				eventList["Key"+key].last = null;
			}
			return KeyInput;
		};
		function keyDown(e){
			e = e || window.event;
			var keyCode = (typeof e.which === "undefined") ? e.keyCode : e.which;
			if(true === keys[keyCode]){return;}
			keys[keyCode] = true;
			if(eventList["Key"+keyCode]){
				var node = eventList["Key"+keyCode].first;
				while(node !== null){
					node.callback(true);
					node = node.next;
				}
			}
		}
		function keyUp(e){
			e = e || window.event;
			var keyCode = (typeof e.which === "undefined") ? e.keyCode : e.which;
			if(false === keys[keyCode]){return;}
			keys[keyCode] = false;
			if(eventList["Key"+keyCode]){
				var node = eventList["Key"+keyCode].first;
				while(node !== null){
					node.callback(false);
					node = node.next;
				}
			}
		}
		KeyInput.cleanup = function(){
			for(var i in keys){
				KeyInput.unbindAll(Number(i));
			}
			document.documentElement.removeEventListener("keyup", keyUp, false);
			document.documentElement.removeEventListener("keydown", keyDown, false);
			delete KeyInput.setKey;
			delete KeyInput.getKey;
			delete KeyInput.bind;
			delete KeyInput.unbind;
			delete KeyInput.unbindAll;
			delete KeyInput.cleanup;
		};
		document.documentElement.addEventListener("keyup", keyUp, false);
		document.documentElement.addEventListener("keydown", keyDown, false);
	}
	var global = global || window;
	global.KeyInput = KeyInput;
}(window, document));
