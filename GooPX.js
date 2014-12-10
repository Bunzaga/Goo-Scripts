(function(window, undefined){
	'use strict';
	var GooPX = {};
	GooPX.System = function(settings){
		goo.System.call(this, 'GooPX.System', ['GooPX.RigidbodyComponent', 'TransformComponent']);
		settings = settings || {};
		_.defaults(settings, {
			gravity:goo.Vector3(0, -9.8, 0)
		});
		this.gravity = new goo.Vector3(settings.gravity);
		console.log('GooPX.System constructor');
	};
	GooPX.System.prototype = Object.create(goo.System.prototype);
	GooPX.System.constructor = GooPX.System;
	GooPX.System.prototype.inserted = function(ent){
	    	console.log('GooPX.System.inserted()');
	    	console.log(ent);
	    	if(ent.['gooPX.RigidBodyComponent']){
	    		console.log('ent has GooPX.RigidbodyComponent');
	    	}
	};
	GooPX.System.prototype.removed = function(){
		console.log('GooPX.System.removed()');
	};
	GooPX.System.prototype.process = function(){
		console.log('GooPX.System.process()');
	};
	GooPX.System.prototype.cleanup = function(ents){
		console.log('GooPX.System.cleanup()');
		for(var i = 0, ilen = ents.length, ent = undefined; i < ilen; i++){
			ent = ents[i];
			if(ent.['gooPX.RigidbodyComponent']){
				ent.clearComponent('GooPX.RigidbodyComponent');
			}
		}
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
