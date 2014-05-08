Goo-Scripts
===========

Several Script Components and Includes to be used within Goo Create.

To use them, add them as an External Resource, inside the script component, then add the following lines:

// this creates a new 'ctx.worldData' object which can be referenced by all other ScriptComponents
function setup(args, ctx, goo){ctx.worldData.ScriptType = new ScriptType(args, ctx, goo);}

// this will deallocate objects, etc, and call delete for the ctx.worldData object
function cleanup(args, ctx, goo){ctx.worldData.ScriptType.cleanup(args, ctx, goo);}

So if we were trying to use the MouseInput.js, we would first add it as an External Resource, and then our script would look like this:

function setup(args, ctx, goo){ctx.worldData.MouseInput = new MouseInput(args, ctx, goo);}

function cleanup(args, ctx, goo){ctx.worldData.MouseInput.cleanup(args, ctx, goo);}
