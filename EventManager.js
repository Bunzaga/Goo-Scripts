(function(window, document){
  var EventManager = {};
  var eventList = {};
  EventManager.setup = function(args, ctx, goo){
    EventManager.bind = function(event, callback, priority){
      
    };
    EventManager.unbind = function(event, callback){
      
    };
    EventManger.unbindAll = function(event){
      
    };
    EventManager.emit = function(event){
      
    };
    EventManager.cleanup = function(){
      delete EventManager.bind;
      delete EventManager.unbind;
      delete EventManager.unbindAll;
      delete EventManager.emit;
      delete EventManager.cleanup;
    };
  };
  var global = global || window;
  global.EventManager = EventManager;
}(window, document, undefined));
