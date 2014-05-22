(function(window, document){
  var EventManager = {};
  var eventList = {};
  EventManager.setup = function(args, ctx, goo){

    EventManager.bind = function(event, callback, priority){
      if(undefined === eventList[event]){
        eventList[event] = {first:null, last:null};
      }
      var node = {previous:null, next:null, callback:callback};
      if(undefined === priority){
        addFirst(eventList[event], node);
      }
      else{
        node.priority = priority;
        addSorted(eventList[event], node);
      }
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
    
    var addFirst = function(list, node){
      
    };
    var addSorted = function(list, node){
      
    };
  };
  var global = global || window;
  global.EventManager = EventManager;
}(window, document, undefined));
