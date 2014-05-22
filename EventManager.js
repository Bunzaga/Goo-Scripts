(function(window, document){
  var EventManager = {};
  var eventList = {};
  EventManager.setup = function(args, ctx, goo){

    EventManager.bind = function(event, callback, priority){
      return EventManager;
    };
    EventManager.unbind = function(event, callback){
      return EventManager;
    };
    EventManger.unbindAll = function(event){
      return EventManager;
    };
    EventManager.emit = function(event){
      return EventManager;
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
