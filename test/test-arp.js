var assert = require('assert');
var arp = require('../lib/arp.js');

arp.getMAC("192.168.1.1", function(err, mac) {
	assert.ok(!err);
	assert.ok(mac != null);
	console.log("Mac Address is " + mac);
});

