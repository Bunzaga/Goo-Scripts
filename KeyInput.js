/* Implement this method to do initializing */
var _ctx = null;
var setup = function(args, ctx, goo) {
	_ctx = ctx;
	ctx.entityData.keys = {};
	ctx.entityData.callbacks = {};
	ctx.entityData.stringToCode = {"backspace":8,"tab":9,"enter":13,"shift":16,"ctrl":17,"alt":18,"pause":19,"caps":20,"esc":27,"space":32,"page up":33,"page down":34,"end":35,"home":36,
	"left":37,"up":38,"right":39,"down":40,"insert":45,"delete":46,"0":48,"1":49,"2":50,"3":51,"4":52,"5":53,"6":54,"7":55,"8":56,"9":57,
	"a":65,"b":66,"c":67,"d":68,"e":69,"f":70,"g":71,"h":72,"i":73,"j":74,"k":75,"l":76,"m":77,"n":78,"o":79,"p":80,"q":81,"r":82,"s":83,"t":84,"u":85,"v":86,"w":87,"x":88,"y":89,"z":90,
	"windows":91,"right click":93,"num0":96,"num1":97,"num2":98,"num3":99,"num4":100,"num5":101,"num6":102,"num7":103,"num8":104,"num9":105,"num*":106,"num+":107,"num-":109,"num.":110,"num/":111,
	"f1":112,"f2":113,"f3":114,"f4":115,"f5":116,"f6":117,"f7":118,"f8":119,"f9":120,"f10":121,"f11":122,"f12":123,"num lock":144,"scroll lock":145,"my computer":182,"my calculator":183,";":186,"=":187,",":188,"-":189,".":190,"/":191,"`":192,"[":219,"\\":220,"]":221,"'":222};
	ctx.worldData.KeyInput = {};
	ctx.worldData.KeyInput.getKey = function(keyCode){
		var key = typeof keyCode === 'number' ? keyCode : _ctx.entityData.stringToCode[keyCode];
		return _ctx.entityData.keys[key];
	}
	
	ctx.worldData.KeyInput.bind = function(keyCode, callback){
		var key = typeof keyCode === 'number' ? keyCode : _ctx.entityData.stringToCode[keyCode];
		_ctx.entityData.keys[key] = false;
		if(callback){
			if(typeof callback === 'function'){
				_ctx.entityData.callbacks[key] = callback;
			}
		}
		return 	_ctx.worldData.KeyInput;
	}

	ctx.worldData.KeyInput.unbind = function(keyCode){
		var key = typeof keyCode === 'number' ? keyCode : _ctx.entityData.stringToCode[keyCode];
		delete _ctx.entityData.keys[key];
		delete _ctx.entityData.callbacks[key];
		return 	_ctx.worldData.KeyInput;
	}

	document.documentElement.addEventListener("keyup", keyUp, false);
	document.documentElement.addEventListener("keydown", keyDown, false);
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(args, ctx, goo) {
	document.documentElement.removeEventListener("keyup", keyUp, false);
	document.documentElement.removeEventListener("keydown", keyDown, false);
};

var keyDown = function(e){
	e = e || window.event;
	var keyCode = (typeof e.which === "undefined") ? e.keyCode : e.which;
	if(null == _ctx.entityData.keys[keyCode]){return;}
	if(true == _ctx.entityData.keys[keyCode]){return;}
	_ctx.entityData.keys[keyCode] = true;
	if(null == _ctx.entityData.callbacks[keyCode]){return;}
	_ctx.entityData.callbacks[keyCode](true);
}
var keyUp = function(e){
	e = e || window.event;
	var keyCode = (typeof e.which === "undefined") ? e.keyCode : e.which;
	if(null == _ctx.entityData.keys[keyCode]){return;}
	if(false == _ctx.entityData.keys[keyCode]){return;}
	_ctx.entityData.keys[keyCode] = false;
	if(null == _ctx.entityData.callbacks[keyCode]){return;}
	_ctx.entityData.callbacks[keyCode](false);
}
