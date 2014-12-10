(function(window, undefined){
	'use strict';
	var GooPX = {};
	GooPX.System = function(settings){
		goo.System.call(this, 'GooPX.System', ['GooPX.RigidbodyComponent']);
		settings = settings || {};
		_.defaults(settings, {
			gravity:goo.Vector3(0, -9.8, 0)
		});
		console.log('GooPX.System constructor');
	};
	GooPX.System.prototype = Object.create(goo.System.prototype);
	GooPX.System.constructor = GooPX.System;
	GooPX.System.prototype.inserted = function(){
	    	console.log('GooPX.System.inserted()');
	};
	GooPX.System.prototype.deleted = function(){
		console.log('GooPX.System.deleted()');
	};
	GooPX.System.prototype.process = function(){
		console.log('GooPX.System.process()');
	};
	GooPX.System.prototype.cleanup = function(){
		console.log('GooPX.System.cleanup()');
	};
  
	GooPX.RigidbodyComponent = function(settings){
		settings = settings || {};
		_.defaults(settings,{
			mass:1.0
		});
		this.type = 'GooPX.RigidbodyComponent';
	};
	GooPX.RigidbodyComponent.prototype = Object.create(goo.Component.prototype);
	GooPX.RigidbodyComponent.constructor = GooPX.RigidbodyComponent;
	var global = global || window;
	window.GooPX = GooPX;
}(window));
