"use strict";
(function(window, document, undefined){
  function NodeList(){
		this.first = null;
		this.last = null;
	};
	NodeList.prototype.addFirst = function(node){
		if(null === this.first){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			node.next = this.first;
			this.first.previous = node;
			this.first = node;
		}
		return this;
	};
	NodeList.prototype.addLast = function(node){
		if(null === this.first){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			this.last.next = node;
			node.previous = this.last;
			node.next = null;
			this.last = node;
		}
		return this;
	};
	NodeList.prototype.addSorted = function(node){
		if(null === this.first){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			var n = this.last;
			while(n !== null){
				if(n.priority > node.priority){
					break;
				}
				n = n.previous;
			}
			if(n === this.last){
				this.last.next = node;
				node.previous = this.last;
				node.next = null;
				this.last = node;
			}
			else if(null === n){
				node.next = this.first;
				node.previous = null;
				this.first.previous = node;
				this.first = node;
			}
			else{
				node.next = n.next;
				node.previous = n;
				n.next.previous = node;
				n.next = node;
			}
		}
		return this;
	};
	NodeList.prototype.remove = function(node){
		if(this.first === node){
			this.first = this.first.next;
		}
		if(this.last === node){
			this.last = this.last.previous;
		}
		if(node.previous != null){
			node.previous.next = node.next;
		}
		if(node.next != null){
			node.next.previous = node.previous;
		}
		return this;
	};
	NodeList.prototype.clear = function(){
		while(null !== this.first){
			var node = this.first;
			this.first = node.next;
			node.previous = null;
			node.next = null;
		}
		this.last = null;
	};
	var global = global || window;
	global.NodeList = NodeList;
}(window, document));
