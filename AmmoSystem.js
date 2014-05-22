'use strict';
(function(window, document){
  function AmmoSystem(args, ctx, goo){
    this.ctx = ctx;
    this.goo = goo;
    this.enabled = true;
  }
  AmmoSystem.parameters = [{
    key:'gravity',
    type:'vec3',
    'default':[0.0, -9.8, 0.0]
  }, {
    key:'maxSubSteps',
    type:'int',
    'default':5
  }, {
    key:'stepFrequency',
    type:'int',
    'default':60
  }];
  var global = global || window;
  global.AmmoSystem = AmmoSystem;
}(window, document, undefined));
