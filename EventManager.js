"use strict";

(function(window, document, undefined){
require.config({
        paths: {
            'NodeList': 'https://bunzaga.github.io/Goo-Scripts/NodeList'
        }
    });
require(['NodeList'], function(NodeList){
	var EventManager = {};
	var eventList = {};
	EventManager.on = function(e, callback, priority){
		if(undefined === eventList[e]){
			require(['NodeList'], function(){
			eventList[e] = new NodeList();
			});
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
	EventManager.off = function(e, callback){
		if(undefined !== eventList[e]){
			if(null === callback){
		    		eventList[e].clear();
				delete eventList[e];
				return EventManager;
			}
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
	EventManager.emit = function(){
		var e = Array.prototype.shift.apply(arguments);
		if(undefined === e){console.error("EventManager: You just pass in an event as the first parameter."); return;}
		if(undefined !== eventList[e]){
			var n = eventList[e].first;
			while(n !== null){
				n.callback.apply(null, arguments);
				n = n.next;
			}
		}
		return EventManager;
	};
	EventManager.cleanup = function(){
		for(var i in eventList){
			EventManager.off(i);
		}
	};
	var global = global || window;
	global.EventManager = EventManager;
});

}(window, document));
