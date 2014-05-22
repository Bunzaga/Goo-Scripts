(function(window, document){
  var EventManager = {};
  var eventList = {};
  EventManager.setup = function(args, ctx, goo){

    EventManager.bind = function(e, callback, priority){
      if(undefined === eventList[e]){
        eventList[e] = {first:null, last:null};
      }
      var node = {previous:null, next:null, callback:callback};
      if(undefined === priority){
        //addFirst(eventList[e], node);
      }
      else{
        node.priority = priority;
        //addSorted(eventList[e], node);
      }
      return EventManager;
    };
    EventManager.unbind = function(e, callback){
      if(undefined === eventList[e]){return;}
      var node = eventList[e].first;
      while(node != null){
      	if(node.callback === callback){
      		break;
      	}
      	node = node.next;
      }
      if(node !== null){
      	if(eventList[e].first === node){
      		eventList[e].first = eventList[e].first.next;
      	}
      	if(eventList[e].last === node){
      		eventList[e].last = eventList[e].last.previous;
      	}
      	if(node.previous !== null){
      		node.previous.next = node.next;
      	}
      	if(node.next !== null ){
      		node.next.previous = node.previous;
      	}
      }
      if(null === eventList[e].first){
      	delete eventList[e];
      }
      return EventManager;
    };
    EventManger.unbindAll = function(e){
      return EventManager;
    };
    EventManager.emit = function(){
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
