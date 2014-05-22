(function(window, document){
  var EventManager = {};
  var eventList = {};
  EventManager.setup = function(){
    EventManager.bind = function(){
      
    }
    EventManager.unbind = function(){
      
    }
    EventManger.unbindAll = function(){
      
    }
    EventManager.emit = function(){
      
    }
    EventManager.cleanup = function(){
      delete EventManager.bind;
      delete EventManager.unbind;
      delete EventManager.unbindAll;
      delete EventManager.emit;
      delete EventManager.cleanup;
    }
  }
  var global = global || window;
  global.EventManager = EventManager;
}(window, document, undefined));
