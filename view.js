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


	var randomBaseNString = function(base, numChars) {
		return ( ~~( Math.random() * Math.pow(base, numChars) ) ).toString(base);
	};

	

	// http://peerjs.com/docs/#api
	var id = location.hash ? location.hash.substring(1) : randomBaseNString(32, 4);
	var peer = new Peer('sh_'+id, {key:PEER_KEY});

	peer.on('open', function(id) {
		location.hash = peer.id.substring(3);
		var qrCodeWrapperEl = document.createElement('div');
		qrCodeWrapperEl.id = 'qr-code';

		var imgEl = document.createElement('img');
		imgEl.src = 'http://chart.googleapis.com/chart?chs=512x512&cht=qr&chld=H|0&chl=' + encodeURIComponent( location.href.replace('view', 'controller') );
		qrCodeWrapperEl.appendChild(imgEl);

		var labelEl = document.createElement('div');
		labelEl.appendChild( document.createTextNode('press space bar to toggle QR code display') );
		qrCodeWrapperEl.appendChild(labelEl);
		
		document.body.appendChild(qrCodeWrapperEl);
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

		var rotSpeed = R360 / 2; // rads/s
		var linSpeed = 200;      // px/s

		var player, s, c;
		for (var peerId in PLAYERS) {
			player = PLAYERS[peerId];
			s = player.sprite;
			c = player.controls;
			if (c[0] !== 0) {
				s.rotation += c[0] * dt * rotSpeed;
				isViewDirty = true;
			}
			if (c[1] !== 0) {
				s.position.x -= c[1] * linSpeed * dt * Math.sin(s.rotation);
				s.position.y += c[1] * linSpeed * dt * Math.cos(s.rotation);
				isViewDirty = true;
			}
		}

		// render the stage
		if (isViewDirty) {
			//log('rendered ' + t.toFixed(3));
			renderer.render(stage);
			isViewDirty = false;
		}
	}



	var toggleQrCodeDisplay = function() {
		var qrEl = document.querySelector('#qr-code');
		if (qrEl) {
			qrEl.classList.toggle('hidden');
		}
	};

	window.addEventListener('keyup', function(ev) {
		if (ev.keyCode === 32) {
			ev.preventDefault();
			ev.stopPropagation();
			toggleQrCodeDisplay();
		}
	});

	window.addEventListener('mouseup',  toggleQrCodeDisplay);
	window.addEventListener('touchend', toggleQrCodeDisplay);

})();
