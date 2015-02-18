var PEER_KEY = 'i5sd6pb4xfnd0a4i';

var hms = function() {
	var d = new Date();
	return d.toISOString().split('T')[1].split('.')[0];
};

var log = function() { window.console.log.apply(window.console, arguments); };
