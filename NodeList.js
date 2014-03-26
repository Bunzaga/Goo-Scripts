/* Implement this method to do initializing */
var setup = function(args, ctx, goo) {
	ctx.world.NodeList = function(){
		this.first = null;
		this.last = null;
	};
	ctx.world.NodeList.prototype.add = function( node ){
		if( null == this.first ){
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
	}
	ctx.world.NodeList.prototype.addSorted = function( node ){
		if( null == this.first ){
			this.first = node;
			this.last = node;
			node.next = null;
			node.previous = null;
		}
		else{
			var n = this.last;
			while(n != null){
				if(n.priority <= node.priority){
					break;
				}
				n = n.previous;
			}
	
			if(n == this.last){
				//console.log("n == this.last");
				this.last.next = node;
				node.previous = this.last;
				node.next = null;
				this.last = node;
			}
			else if(null == n){
				//console.log("null == n");
				node.next = this.first;
				node.previous = null;
				this.first.previous = node;
				this.first = node;
			}
			else{
				//console.log();
				node.next = n.next;
				node.previous = n;
				n.next.previous = node;
				n.next = node;
			}
		}
	}
	
	ctx.world.NodeList.prototype.addFirst = function( node ){
		if( null == this.first ){
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
	}
	
	ctx.world.NodeList.prototype.remove = function( node ){
		if( this.first == node ){
			this.first = this.first.next;
		}
		if( this.last == node){
			this.last = this.last.previous;
		}
		if( node.previous != null ){
			node.previous.next = node.next;
		}
		if( node.next != null ){
			node.next.previous = node.previous;
		}
	}
	
	ctx.world.NodeList.prototype.clear = function(){
		while( null != this.first ){
			var node = this.first;
			this.first = node.next;
			node.previous = null;
			node.next = null;
		}
		this.last = null;
	}
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(parameters, context, goo) {
	_ctx = null;
	_args = null;
};

/**
 * This function will be called every frame
 *
 * @param {object} parameters Contains all the parameters defined in externals.parameters
 * with values defined in the script panel
 *
 * @param {object} context A contextual data object unique for the script
 * {
 *  world: World,
 *  domElement: canvas
 *  viewportWidth: number
 *  viewportHeight: number
 *  activeCameraEntity: Entity
 *  entity: Entity
 * }
 * You can also add properties to this object that will be shared between the functions
 *
 * @param {object} goo Contains a bunch of helpful engine classes like
 * goo.Vector3, goo.Matrix3x3, etc. See api for more info
 */
var update = function(parameters, context, goo) {
};

/**
 * Parameters follow:
 * {
 *  key: string,
 *  name?: string,
 *  type: enum ('int', 'float', 'string', 'boolean', 'vec3'),
 *  control?: enum (
 *   'slider', // For numbers with min and max.
 *   'color', // For vec3 that are RGB and should have color pickers.
 *   'select', // Used together with options.
 *  ),
 *  options?: *[] // Array of values of specified type.
 *  'default: *, // Depending of data type. Should be one of the options if options are used.
 *  min?: number, // Can be used when data type is float or int
 *  max?: number, // Can be used when data type is float or int
 *  scale?: number, // How fast number values will change when dragged up and down
 *  decimals?: number, // Override number of decimals. Int defaults to 0 and float to 2.
 *  exponential?: boolean, // Used together with slider
 * }
 */
var parameters = [];
