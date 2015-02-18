(function() {

	'use strict';



	var send;

	var DOWN = false;

	var debug = false;

	if (debug) {
		var sEls = [];
		sEls[0] = document.createElement('span');
		sEls[0].id = 's1';
		document.body.appendChild(sEls[0]);
		sEls[1] = document.createElement('span');
		sEls[1].id = 's2';
		document.body.appendChild(sEls[2]);
	}



	var dims = [window.innerWidth, window.innerHeight];
	var minDim = Math.min(dims[0], dims[1]);
	var radius = ~~(minDim/10);
	var deadZone = ~~(radius * 0.3);

	

	var sign = function(n) {
		return ( (n < 0) ? -1 : 1);
	};

	var inLeftPart = function(ev) {
		ev = (ev.changedTouches && ev.changedTouches[0]) ? ev.changedTouches[0] : ev;
		return ev[0].pageX < dims[0]/2;
	};

	var j1 = new window.VirtualJoystick({
		container:        document.body,
		mouseSupport:     true,
		limitStickTravel: true,
		stickRadius:      radius
	});
	j1.addEventListener('touchStartValidation', inLeftPart);

	var j2 = new window.VirtualJoystick({
		container:        document.body,
		mouseSupport:     true,
		limitStickTravel: true,
		stickRadius:      0,
		strokeStyle:      'orange'
	});
	j2.addEventListener('touchStartValidation', function(ev) { return !inLeftPart(ev); });
	j2.addEventListener('touchStart', function() {
		DOWN = true;
		if (debug) {
			sEls[1].innerHTML = 'DOWN';
		}
	});
	j2.addEventListener('touchEnd', function() {
		DOWN = false;
		if (debug) {
			sEls[1].innerHTML = 'UP';
		}
	});



	var lastPacket = '';
	var fetchController = function() {
		var x = j1.deltaX();
		var y = j1.deltaY();
		var X = ( (Math.abs(x) < deadZone) ? 0 : sign(x));
		var Y = ( (Math.abs(y) < deadZone) ? 0 : sign(y));
		
		if (debug) {
			sEls[0].innerHTML = ['X: ', X, ' | Y: ', Y].join('');
		}

		var packet = [X, Y, DOWN ? 1 : 0].join(' ');

		if (packet === lastPacket) { return; }
		lastPacket = packet;

		//log(packet);
		send(packet);
	};



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

		setInterval(fetchController, 1000/10);
	}
	
})();
