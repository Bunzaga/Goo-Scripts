/* Implement this method to do initializing */
var _ctx = null;
var _args = null;
var state = 0;
var setup = function(args, ctx, goo) {
	_ctx = ctx;
	_args = _args;
	state = 0;
};

/* Implement this method to do cleanup on script stop and delete */
var cleanup = function(parameters, context, goo) {};

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
 function EventManager(name, ctx){
    if (!ctx[name]){
    	var listeners = {};
        this.bind = function(e, o, c, p){
        	if(null == listeners[e]){
        		listeners[e] = new ctx.NodeList();
        	}
        	else{
        		for(var n = listeners[e].first; n; n = n.next){
        			if(n.object === o){
        				console.warn("Callback already exists for this object!");
        				return;
        			}
        		}
        	}
        	var node = {
        		next:null,
        		previous:null,
        		callback:c,
        		object:o
        	};
        	if(null == p){
        		listeners[e].addFirst(node);
        	}
        	else{
        		node.priority = p;
        		listeners[e].addSorted(node);
        	}
        	return this;
        };
        this.unbind = function(e, o){
	        if(null == listeners[e]){
				return;
			}
			var n = listeners[e].first;
			for(var n = listeners[e].first; n; n = n.next){
				if(n.object === o){
					listeners[e].remove(n);
				}
			}
			return this;
        };
	    this.raise = function(){
			var e = [].shift.apply(arguments);
			if(null == e){return;}
			if(null == listeners[e]){
				return;
			}
			var n = listeners[e].first;
			for(var n = listeners[e].first; n; n = n.next){
				n.callback.apply(n.object, arguments);
			}
			return this;
		}
       	ctx[name] = this;
    }
    return ctx[name];
};
var update = function(args, ctx, goo) {
	switch(state){
		case 0:
		if(ctx.world.NodeList){
			new EventManager(_args.name, ctx.world);
			state = 1;
		}
		break;
	}
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
var parameters = [{key:'name', default:'em', type:'string'}];
