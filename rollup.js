var dgram = require('dgram');
var sys = require('sys');
var Collector = require('./lib/collector').Collector;

var config = {
	udp_port	: 8464,		// port for UDP server to listen on

	bucket_ms	: 1000 * 10,	// 10s : the data resolution
	check_ms	: 1000,		// 1s : how often to check for completed buckets. don't need to modify this
	trim_top	: 85,		// averages will be the bottom 85th percentile

	debug		: true,		// sollect some fake debug stats
};


//
// this is the object that collects and rolls up data. we
// just need to feed it data via addData() and listen for
// its 'data' event to get reports.
//

var collector = new Collector(config);


//
// create a simple UDP server to collect stats and feed
// them into the aggregator
//

var server = dgram.createSocket('udp4', function(msg, rinfo){
	var bits = msg.toString('utf8').split(':');
	collector.addData(bits[0], parseInt(bits[1]));
});
server.bind(config.udp_port);


//
// this handler will get called whenever we get some
// data rolled up. it will have already been processed
// into a format we can smush into RRD/whatever
//

collector.on('data', function(data){

	console.log('GOT SOMETHING!');
	console.log(sys.inspect(data, false, 4));
});


//
// if you want to test the aggregation and recording events,
// then these intervals will report some test data to get you
// started.
//

if (config.debug){
	setInterval(function(){ collector.addData('debug_1', Math.random() * 10); }, 200);
	setInterval(function(){ collector.addData('debug_2', 3); }, 300);
	setInterval(function(){ collector.addData('debug_3_ok', (Math.random() * 10) > 6 ? 1 : 0); }, 100);
}
