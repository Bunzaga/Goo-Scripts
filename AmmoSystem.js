"use strict";
(function(window, document){
  function AmmoSystem(args, ctx, goo){
    this.args = args;
    this.ctx. = ctx;
    this.goo = goo;
  }
  AmmoSystem.parameters = [
    {key:'gravity', type:'vec3', default:[0.0, -9.8, 0.0]},
    {key:'maxSubSteps', type:'int', defaults:5},
    {key:'stepFrequency',  type:'int', defaults:60}
  ];
  var global = global || window;
  global.AmmoSystem = AmmoSystem;
}(window, document, undefined));
