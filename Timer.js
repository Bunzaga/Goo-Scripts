(function(window, document, undefined){
	var Timer = {};
	var ft = (1.0 / Timer.fps); // forecasted dt
	var pFt = (1.0 / Timer.fps); // previous forecasted dt
	
	var tr = 0.0; // trend
	var pTr = 0.0; // previous trend
	
	var avg = (2/(1 + Timer.fps)); // dt average
	var maxFrame = this.ft * 10;

	Timer.fps = 60;
	Timer.dt = 1.0 / Timer.fps; // smoothed dt
	Timer.fixedFPS = 60;
	Timer.fixedDT = 1.0 / Timer.fixedFPS;
	Timer.time = 0.0;
	Timer.timeScale = 1.0;
	Timer.alpha = 0.0;
	Timer.negAlpha = 0.0;
	Timer.accumulated = 0.0;
	Timer.ltpf = new Date().getTime() * 0.001;

	Timer.prototype.update = function(){
	  	var now = new Date().getTime() *0.001;
	  	tpf = (now - Timer.ltpf);
	  	Timer.ltpf = now;
	  	
	  	if(tpf > this.maxFrame){tpf = maxFrame;}
	  
	  	pFt = ft;
	  	pTr = tr;
	  
	  	ft = ((tpf * avg) + ((1-avg) * (pFt + pTr))) * Timer.timeScale;
	  	
	  	tr = ((ft - pFt) * avg) + ((1 - avg) * pTr);
	  
	  	Timer.dt = ft + tr;
	  	Timer.time += Timer.dt;
	  	Timer.now = now;
	    	if(Timer.update){
	    		Timer.update();
	    	}
	  	Timer.accumulated += Timer.dt;
	  	while(Timer.fixedDT < Timer.accumulated){
	  	  	// raise physics update
	  	  	if(Timer.fixedUpdate){
	  	  		Timer.fixedUpdate();
	  	  	}
	  		Timer.accumulated -= Timer.fixedDT;
	  	}
	  	Timer.alpha = Timer.accumulated / Timer.fixedDT;
	  	Timer.negAlpha = 1 - Timer.alpha;
	  	// raise late update (render)
	  	if(Timer.lateUpdate){
	  		Timer.lateUpdate();
	  	}
	}
	var global = global || window;
	global.Timer = Timer;
}(window, document));
