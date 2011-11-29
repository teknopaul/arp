var assert = 	require('assert');
var nodeunit = 	require('nodeunit');
var arp = 	require('arp');


/**
 * nodeunit test cases, check the mac for 192.168.1.1
 * If this IP is not on your local subnet change the IP to one that is.
 */
module.exports.test = function(test) {

	arp.readMAC("192.168.1.1", function(err, mac) {
		
		test.ok( ! err);
		
		test.ok(mac != null);
		
		console.log("Mac Address is " + mac);
		
		test.done();
	});
	
};
