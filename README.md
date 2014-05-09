Goo-Scripts
===========

Several Script Components and Includes to be used within Goo Create.

To use them, add them as an External Resource, inside the script component, then add the following lines:

function setup(args, ctx, goo){[ScriptType].setup(args, ctx, goo);}

// this will deallocate objects, etc

function cleanup(args, ctx, goo){[ScriptType].cleanup();}

So if we were trying to use the MouseInput.js, we would first add it as an External Resource, and then our script would look like this:

function setup(args, ctx, goo){MouseInput.setup(args, ctx, goo);}

function cleanup(args, ctx, goo){MouseInput.cleanup();}
