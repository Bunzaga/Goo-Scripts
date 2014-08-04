(function(window, document){
	var EventManager = {};
	var eventList = {};

	EventManager.bind = function(e, callback, priority){
		console.log(arguments);
		if(undefined === eventList[e]){
			eventList[e] = new NodeList();
		}
		var node = {previous:null, next:null, callback:callback};
		if(undefined === priority){
			eventList[e].addFirst(node);
		}
		else{
			node.priority = priority;
			eventList[e].addSorted(node);
	      }
	      return EventManager;
	};
	EventManager.unbind = function(e, callback){
		if(null === callback){
			console.warn("EventManager.unbind: You should pass in the callback to remove as the second parameter, calling EventManger.unbindAll instead.");
			EventManager.unbindAll(e);
			return EventManager;
		}
		if(undefined !== eventList[e]){
			
		        var node = eventList[e].first;
		        while(node != null){
		        	if(node.callback === callback){
		        		break;
		        	}
		        	node = node.next;
		        }
		        if(node !== null){
		        	eventList[e].remove(node);
		        }
		        if(null === eventList[e].first){
		        	delete eventList[e];
		        }
		}
		return EventManager;
	};
    EventManager.unbindAll = function(e){
    	if(undefined !== eventList[e]){
    		eventList[e].clear();
		delete eventList[e];
	}
	return EventManager;
    };
	EventManager.emit = function(){
		var e = Array.prototype.shift.apply(arguments);
		if(undefined === e){console.error("EventManager: You just pass in an event as the first parameter."); return;}
		if(undefined !== eventList[e]){
			var n = eventList[e].first;
			while(n !== null){
				n.callback(arguments);
				n = n.next;
			}
		}
		return EventManager;
	};
	EventManager.cleanup = function(){
		for(var i in eventList){
			EventManager.unbindAll(i);
		}
	};
	var global = global || window;
	global.EventManager = EventManager;
}(window, document, undefined));
