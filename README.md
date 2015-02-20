# SHIPS

_a multiplayer game experiment_


## one view

The idea is to have a dedicated view for every player to look-at (`view.html`), as if playing in a game console.  
This view renders WebGL accelerated [pixijs](http://www.pixijs.com/) sprites.  
It uses [peerjs](http://peerjs.com/)-powered WebRTC to obtain other browsers' control inputs.


## several controllers

Then each player visits the controller page (`controller.html`),  
where one can control a ship either via:

* touch events (left-side d-pad), if supported or,
* keyboard keys (arrow keys), otherwise.

Touch controls make use of the awesome [virtualjoystick](https://github.com/jeromeetienne/virtualjoystick.js).  
Keyboard handling is managed with a simple stuff I pulled up [here](keys.js).


## pairing

Notice than starting the view page, a hash is assigned to the page location.  
Make sure you enter the same key in the controller page to play in that game instance.


## current state

Notice that the game itself is currently just a stub.
Will do something more interesting soon, hopefully.
