var dgram = require('dgram');
var sys = require('sys');
var Collector = require('./lib/collector').Collector;
var RRDWriter = require('./lib/rrdwriter').RRDWriter;

var config = {
	udp_port	: 8464,		// port for UDP server to listen on

	bucket_ms	: 1000 * 10,	// 10s : the data resolution
	check_ms	: 1000,		// 1s : how often to check for completed buckets. don't need to modify this
	trim_top	: 85,		// averages will be the bottom 85th percentile

	debug_collect	: true,		// collect some fake debug stats
	debug_dump	: false,	// dump all rollups to console

	rrd_root	: './rrds',				// folder to put rrd files in
	rrdtool		: '/opt/rrdtool-1.4.4/bin/rrdtool',	// rrdtool binary. this is the default install location. srsly?
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
// into a format we can smush into RRD/whatever.
//

collector.on('data', function(data){
	if (config.debug_dump){
		console.log('GOT SOMETHING!');
		console.log(sys.inspect(data, false, 4));
	}else{
		sys.print('.');
	}
});


//
// here we're hooking it up directly to an RRD writer
// that knows how to deal with rolled up data events.
// nice!
//

var writer = new RRDWriter(config);
collector.on('data', writer.store);


//
// if you want to test the aggregation and recording events,
// then these intervals will report some test data to get you
// started.
//

if (config.debug_collect){
	setInterval(function(){ collector.addData('debug_1', Math.random() * 1000); }, 200);
	setInterval(function(){ collector.addData('debug_2', 3); }, 300);
	setInterval(function(){ collector.addData('debug_3_ok', (Math.random() * 10) > 6 ? 1 : 0); }, 100);
}
