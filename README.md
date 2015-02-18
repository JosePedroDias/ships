# SHIPS

_This is a multiplayer game experiment_

The idea is to have a dedicated view for every player (`view.html`).  
This renders in WebGL accelerated pixijs sprites.  
It uses WebRTC to subscribe other browsers' control inputs.

Then each player visits the controller page (`controller.html`),  
where one can control a ship either via:

* touch events (left-side d-pad), if supported or
* keyboard keys (arrow keys), otherwise.

Notice than starting the view page, a hash is assigned to the page location.  
Use the same key in the controller page to play that game instance.
