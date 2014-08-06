(function(window, document, undefined){
  var Timer = function(){
    this.ft = (1.0 / Timer.fps); // forecasted dt
  	this.pFt = (1.0 / Timer.fps); // previous forecasted dt
  
  	this.tr = 0.0; // trend
  	this.pTr = 0.0; // previous trend
  
  	this.avg = (2/(1 + Timer.fps)); // dt average
  	this.maxFrame = this.ft * 10;
  };
  Timer.prototype.constructor = Timer;
  
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
  	var tpf = tpf || (now - Timer.ltpf);
  	Timer.ltpf = now;
  	
  	if(tpf > this.maxFrame){tpf = this.maxFrame;}
  
  	this.pFt = this.ft;
  	this.pTr = this.tr;
  
  	this.ft = ((tpf * this.avg) + ((1-this.avg) * (this.pFt + this.pTr))) * Timer.timeScale;
  	
  	this.tr = ((this.ft - this.pFt) * this.avg) + ((1 - this.avg) * this.pTr);
  
  	Timer.dt = this.ft + this.tr;
  	Timer.time += Timer.dt;
  	Timer.now = now;
    // raise update
  	Timer.accumulated += Timer.dt;
  	while(Timer.fixedDT < Timer.accumulated){
  	  // raise physics update
  		Timer.accumulated -= Timer.fixedDT;
  	}
  	Timer.alpha = Timer.accumulated / Timer.fixedDT;
  	Timer.negAlpha = 1 - Timer.alpha;
  	// raise late update (render)
	}
	var global = global || window;
	global.Timer = Timer;
}(window, document));
