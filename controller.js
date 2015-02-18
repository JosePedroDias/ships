(function() {

	'use strict';



	var debug        = true;
	var supportMouse = false;
	var eventsPerSecond = 10;

	var send;
	var lastPacket = '';
	var fetchController;

	var hasTouch = ('ontouchstart' in document.documentElement);



	var sEls = [];
	if (debug) {
		(function() {
			var sEl;
			sEl = document.createElement('span');
			sEl.id = 's1';
			sEls.push(sEl);
			document.body.appendChild(sEl);

			sEl = document.createElement('span');
			sEl.id = 's2';
			sEls.push(sEl);
			document.body.appendChild(sEl);
		})();
	}



	var sendControls = function(X, Y, isBDown) {
		if (debug) {
			sEls[0].innerHTML = ['X: ', X, ' | Y: ', Y].join('');
			sEls[1].innerHTML = (isBDown ? 'DOWN' : 'UP');
		}

		var packet = [X, Y, isBDown ? 1 : 0].join(' ');

		if (packet === lastPacket) { return; }
		lastPacket = packet;

		//log(packet);
		send(packet);
	};



	if (hasTouch) {
		(function() {
			var dims = [window.innerWidth, window.innerHeight];
			var minDim = Math.min(dims[0], dims[1]);
			var radius = ~~(minDim/10);
			var deadZone = ~~(radius * 0.3);
			var isButtonDown = false;

			var sign = function(n) {
				return ( (n < 0) ? -1 : 1);
			};

			var inLeftPart = function(ev) {
				ev = (ev.changedTouches && ev.changedTouches[0]) ? ev.changedTouches[0] : ev;
				return ev[0].pageX < dims[0]/2;
			};

			var j1 = new window.VirtualJoystick({
				container:        document.body,
				mouseSupport:     supportMouse,
				limitStickTravel: true,
				stickRadius:      radius,
				strokeStyle:      'green'
			});
			j1.addEventListener('touchStartValidation', inLeftPart);

			var j2 = new window.VirtualJoystick({
				container:        document.body,
				mouseSupport:     supportMouse,
				limitStickTravel: true,
				stickRadius:      0,
				strokeStyle:      'blue'
			});
			j2.addEventListener('touchStartValidation', function(ev) { return !inLeftPart(ev); });

			j2.addEventListener('touchStart', function() { isButtonDown = true;  });
			j2.addEventListener('touchEnd',   function() { isButtonDown = false; });

			fetchController = function() {
				var x = j1.deltaX();
				var y = j1.deltaY();
				var X = ( (Math.abs(x) < deadZone) ? 0 : sign(x));
				var Y = ( (Math.abs(y) < deadZone) ? 0 : sign(y));
				
				sendControls(X, Y, isButtonDown);
			};
		})();
	}
	else {
		(function() {
			var k = keys();

			var k_up    = k.keyCodes.up;
			var k_down  = k.keyCodes.down;
			var k_left  = k.keyCodes.left;
			var k_right = k.keyCodes.right;
			var k_fire  = k.keyCodes.space;

			fetchController = function() {
				var X = 0;
				var Y = 0;
				var isBDown = k.isKeyDown(k_fire);
				if (k.isKeyDown(k_left)) {  X -= 1; }
				if (k.isKeyDown(k_right)) { X += 1; }
				if (k.isKeyDown(k_up)) {    Y -= 1; }
				if (k.isKeyDown(k_down)) {  Y += 1; }

				sendControls(X, Y, isBDown);
			};
		})();
	}
	



	var peer = new Peer({key:PEER_KEY});

	peer.on('open', function(id) {
		log('my id is: ' + peer.id);
	});

	peer.on('error', function(err) {
		log('error ' + err);
	});

	

	var label = localStorage.getItem('label') || '';
	label = prompt('player name?', label);
	if (!label) { label = 'player_' + ~~( Math.random() * 10000 ); }
	localStorage.setItem('label', label);

	var remoteId = localStorage.getItem('remoteId') || '';
	remoteId = prompt('view id?', remoteId);
	if (remoteId) {
		localStorage.setItem('remoteId', remoteId);
		var dataConn = peer.connect(remoteId, {label:label});

		send = function(data) {
			dataConn.send(data);
		};

		setInterval(fetchController, 1000/eventsPerSecond);
	}
	
})();
