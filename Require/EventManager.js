define("EventManager", ['https://bunzaga.github.io/Goo-Scripts/Require/NodeList.js'], function(NodeList){
"use strict";
	var EventManager = {};
	var eventList = {};
	EventManager.on = function(e, callback, priority){
		if(undefined === eventList[e]){
			eventList[e] = new NodeList();
		}
		var node = {previous:null, next:null, callback:callback};
		if(undefined === priority){
			eventList[e].addLast(node);
		}
		else{
			node.priority = priority;
			eventList[e].addSorted(node);
	      }
	      return EventManager;
	};
	EventManager.off = function(e, callback){
		if(undefined !== eventList[e]){
			if(undefined === callback){
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
		var e = [].shift.apply(arguments);
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
	return EventManager;
});
