var util = require('util');
var spawn = require('child_process').spawn;

/**
 * Read the MAC address from the ARP table.
 * 
 * 3 methods for lin/win/mac  Linux reads /proc/net/arp
 * mac and win read the output of the arp command.
 * 
 * all 3 ping the IP first without checking the response to encourage the
 * OS to update the arp table.
 * 
 * 
 */
module.exports.getMAC = function(ipaddress, cb) {
	if(process.platform.indexOf('linux') == 0) {
		exports.readMACLinux(ipaddress, cb);
	}
	else if (process.platform.indexOf('win') == 0) {
		exports.readMACWindows(ipaddress, cb);
	}
	else if (process.platform.indexOf('darwin') == 0) {
		exports.readMACMac(ipaddress, cb);
	}
};

/**
 * read from cat /proc/net/arp
 */
module.exports.readMACLinux = function(ipaddress, cb) {
	
	// ping the ip address to encourage the kernel to populate the arp tables
	var ping = spawn("ping", ["-c", "1", ipaddress]);
	
	ping.on('exit', function (code) {
		// not bothered if ping did not work
		
		var arp = spawn("cat", ["/proc/net/arp"] );
		var buffer = '';
		var errstream = '';
		arp.stdout.on('data', function (data) {
			buffer += data;
		});
		arp.stderr.on('data', function (data) {
			errstream += data;
		});
		
		arp.on('close', function (code) {
			if (code != 0) {
				console.log("Error running arp " + code + " " + errstream);
				cb(true, code);
			}
			var table = buffer.split('\n');
			for ( var l = 0; l < table.length; l++) {
				
				// parse this format
				//IP address       HW type     Flags       HW address            Mask     Device
				//192.168.1.1      0x1         0x2         50:67:f0:8c:7a:3f     *        em1
				
				if (l == 0) continue;
				
				if (table[l].indexOf(ipaddress) == 0) {
					var mac = table[l].substring(41, 58);
					cb(false, mac);
					return;
				}
			}
			cb(true, "Count not find ip in arp table: " + ipaddress);
		});
	});	
	
};

/**
 * NOT TESTED (I dont have a windows box)
 * read from arp -a 192.168.1.1
 */
module.exports.readMACWindows = function(ipaddress, cb) {
	
	// ping the ipa ddress to encourage the kernel to populate the arp tables
	var ping = spawn("ping", ["-n", "1", ipaddress ]);
	
	ping.on('exit', function (code) {
		// not bothered if ping did not work
		
		var arp = spawn("arp", ["-a", ipaddress] );
		var buffer = '';
		var errstream = '';
		arp.stdout.on('data', function (data) {
			buffer += data;
		});
		arp.stderr.on('data', function (data) {
			errstream += data;
		});
		
		arp.on('exit', function (code) {
			if (code != 0) {
				console.log("Error running arp " + code + " " + errstream);
				cb(true, code);
			}
			var table = buffer.split('\r\n');
			for ( var l = 0; l < table.length; l++) {
				if (l == 0) continue;
				
				// parse this format
				//[blankline]
				//Interface: 192.º68.1.54
				//  Internet Address      Physical Address     Type
				//  192.168.1.1           50-67-f0-8c-7a-3f    dynamic
				
				if (table[l].indexOf("  " + ipaddress) == 0) {
					var mac = table[l].substring(24, 41);
					mac = mac.replace(/-/g, ':');
					cb(false, mac);
					return;
				}
			}
			cb(true, "Count not find ip in arp table: " + ipaddress); 
		});
	});	
	
};
/**
 * NOT TESTED (I dont have a MAC)
 * read from arp 192.168.1.1
 */
module.exports.readMACMac = function(ipaddress, cb) {
	
	// ping the ip address to encourage the kernel to populate the arp tables
	var ping = spawn("ping", ["-c", "1", ipaddress ]);
	
	ping.on('exit', function (code) {
		// not bothered if ping did not work
		
		var arp = spawn("arp", ["-n", ipaddress] );
		var buffer = '';
		var errstream = '';
		arp.stdout.on('data', function (data) {
			buffer += data;
		});
		arp.stderr.on('data', function (data) {
			errstream += data;
		});
		
		arp.on('exit', function (code) {
			  if (code != 0) {
				  console.log("Error running arp " + code + " " + errstream);
				  cb(true, code);
			  }
			  var table = buffer.split('\n\r');
			  for ( var l = 0; l < table.length; l++) {

				// parse this format
				//ahost (216.86.77.194) at 00:e0:18:d3:6f:3f on bge0 static
				
				if (table[l].indexOf(ipaddress) > 0) {
					var parts = table[l].split(" ");
					var mac = parts[3];
					mac = mac.replace(/-/g, ':');
					cb(false, mac);
					return;
				}
			}
			cb(true, "Count not find ip in arp table: " + ipaddress);
		});
	});	
	
};
