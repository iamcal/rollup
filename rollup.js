var dgram = require('dgram');
var sys = require('sys');
var Collector = require('./lib/collector').Collector;

var config = {
	port		: 8464,
	bucket_ms	: 1000 * 10, // 10s
	check_ms	: 1000,
};


function num_keys(a){
	var i=0;
	for (var j in a) i++;
	return i;
}

var collector = new Collector(config);

var server = dgram.createSocket('udp4', function(msg, rinfo){
	var bits = msg.toString('utf8').split(':');
	collector.addData(bits[0], parseInt(bits[1]));
});
server.bind(config.port);


collector.on('data', function(data){

	console.log('GOT SOMETHING!');
	console.log(sys.inspect(data, false, 4));
});

setInterval(function(){ collector.addData('d1', 2); }, 200);
setInterval(function(){ collector.addData('d2', 3); }, 300);
