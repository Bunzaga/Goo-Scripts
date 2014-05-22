(function(window, document){
	var EventManager = {};
	var eventList = {};

	EventManager.bind = function(e, callback, priority){
		if(undefined === eventList[e]){
			eventList[e] = {first:null, last:null};
		}
		var node = {previous:null, next:null, callback:callback};
		if(undefined === priority){
			if(null === eventList[e].first){
    				eventList[e].first = node;
    				eventList[e].last = node;
    				node.next = null;
    				node.previous = null;
    			}
    			else{
    				node.next = eventList[e].first;
    				eventList[e].first.previous = node;
    				eventList[e].first = node;
    			}
		}
		else{
			node.priority = priority;
			if(null == eventList[e].first){
				eventList[e].first = node;
				eventList[e].last = node;
				node.next = null;
				node.previous = null;
			}
			else{
				var n = eventList[e].last;
	    			while(n != null){
	    				if(n.priority <= node.priority){
	    					break;
	    				}
	    				n = n.previous;
	    			}
	    
	    			if(n == eventList[e].last){
	    				eventList[e].last.next = node;
	    				node.previous = eventList[e].last;
	    				node.next = null;
	    				eventList[e].last = node;
	    			}
	    			else if(null == n){
	    				node.next = eventList[e].first;
	    				node.previous = null;
	    				eventList[e].first.previous = node;
	    				eventList[e].first = node;
	    			}
	    			else{
	    				node.next = n.next;
	    				node.previous = n;
	    				n.next.previous = node;
	    				n.next = node;
	    			}
	    		}
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
		}
		return EventManager;
	};
    EventManager.unbindAll = function(e){
    	if(undefined !== eventList[e]){
			while(null !== eventList[e].first){
				var n = eventList[e].first;
				eventList[e].first = n.next;
				n.previous = null;
				n.next = null;
			}
			eventList[e].last = null;
			delete eventList[e];
		}
		return EventManager;
    };
    EventManager.emit = function(){
		var e = [].shift.apply(arguments);
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
