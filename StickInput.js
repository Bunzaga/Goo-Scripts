/****  This script is a work in progress and is not ready for use ****/
"use strict";
(function(window, document, undefined){
  var StickInput = {};
  var haveEvents = 'GamepadEvent' in window;
  var gamepads = {};
  StickInput.ready = false;
  
  function stickAdded(e){
    stickHandler(e, true);
  }
  function stickRemoved(e){
    stickHandler(e, false);
  }
  
  function stickHandler(e, connecting){
    var gamepad = navigator.getGamepads()[e.gamepad.index];
    
    if (connecting) {
      gamepads[gamepad.index] = gamepad;
      console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
      gamepad.index, gamepad.id,
      gamepad.buttons.length, gamepad.axes.length);
    }else{
      delete gamepads[gamepad.index];
      console.log("Gamepad removed at index %d: %s. %d buttons, %d axes.",
      gamepad.index, gamepad.id,
      gamepad.buttons.length, gamepad.axes.length);
    }
  }
  
  function pollStatus(){
  	
  }
  
  
	StickInput.setup = function(){
		window.addEventListener("gamepadconnected", stickAdded, false);
		window.addEventListener("gamepaddisconnected", stickRemoved, false);
		StickInput.ready = true;
	}
	StickInput.cleanup = function(){
		for(var i in gamepads){
			if(gamepads.hasOwnProperty(i)){
			  delete gamepads[i];
				//KeyInput.off(Number(i));
			}
		}
		window.removeEventListener("gamepadconnected", stickAdded, false);
		window.removeEventListener("gamepaddisconnected", stickRemoved, false);
		StickInput.ready = false;
	};

  var global = global || window;
	global.StickInput = StickInput;
}(window, document));
