(function() {

	'use strict';



	var PLAYERS = {};

	var label = 'view_' + ~~( Math.random() * 10000 );

	var isViewDirty = true;



	// http://www.goodboydigital.com/pixijs/docs/

	var W = window.innerWidth;
	var H = window.innerHeight;

	var D2R = Math.PI / 180;
	var R2D = 180 / Math.PI;
	var D360 = 360;
	var R360 = Math.PI * 2;

	// create an new instance of a pixi stage
	var stage = new PIXI.Stage(0x224466);

	// create a renderer instance
	//var renderer = new PIXI.WebGLRenderer(W, H);
	//var renderer = new PIXI.CanvasRenderer(W, H);
	var renderer = PIXI.autoDetectRenderer(W, H);

	// create a texture from an image path
	var texture = PIXI.Texture.fromImage('spaceship.png');

	// add the renderer view element to the DOM
	document.body.appendChild(renderer.view);

	requestAnimFrame( animate );



	var addPlayerSprite = function() {
		// create a new Sprite using the texture
		var s = new PIXI.Sprite(texture);

		// center the sprites anchor point
		s.anchor.x = 0.5;
		s.anchor.y = 0.5;

		// move the sprite t the center of the screen
		s.position.x = W/2;
		s.position.y = H/2;

		s.scale.x = 0.5;
		s.scale.y = 0.5;

		stage.addChild(s);

		isViewDirty = true;

		return s;
	};

	



	var peer = new Peer({key:PEER_KEY});

	peer.on('open', function(id) {
		log('my id (view id) is: ' + peer.id);
		document.title = peer.id;
		location.hash = peer.id;
	});

	peer.on('error', function(err) {
		log('error ' + err);
	});

	peer.on('connection', function(dataConn) {
		var O = {controls:[0, 0, false], sprite:addPlayerSprite()};
		PLAYERS[dataConn.peer] = O;

		dataConn.on('error', function(err) { log('error ' + err); });

		dataConn.on('open', function() {
			log('+' + dataConn.peer + ' (' + dataConn.label + ')');
		});

		dataConn.on('close', function() {
			log('-' + dataConn.peer + ' (' + dataConn.label + ')');
			stage.removeChild(O.sprite);
			isViewDirty = true;
			delete PLAYERS[dataConn.peer];
		});
		
		dataConn.on('data', function(data) {
			var d = data.split(' ');
			d = [ parseFloat(d[0]), parseFloat(d[1]), d[2] === '1' ];
			O.controls = d;
		});
	});



	var t0 = -1/30;
	function animate(t) {
		requestAnimFrame( animate );

		t /= 1000;
		var dt = t - t0;
		t0 = t;
		//log(t, dt);

		var player, s, c;
		for (var peerId in PLAYERS) {
			player = PLAYERS[peerId];
			s = player.sprite;
			c = player.controls;
			if (c[0] !== 0) {
				s.rotation += c[0] * dt * R360 / 2;
				isViewDirty = true;
			}
			if (c[1] !== 0) {
				s.position.y += c[1] * dt * 100;
				isViewDirty = true;
			}
		}

		// render the stage
		if (isViewDirty) {
			console.log('rendered ' + t.toFixed(3));
			renderer.render(stage);
			isViewDirty = false;
		}
	}

})();
