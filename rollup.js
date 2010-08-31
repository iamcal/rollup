var dgram = require('dgram');
var sys = require('sys');

var config = {
	port		: 8464,
	bucket_ms	: 1000 * 10, // 10s
	check_ms	: 1000,
};

function Collector(){

	var self = this;

	this.buckets = {};

	this.addData = function(stat, value){
		var bucket = self.getBucket();
		if (!self.buckets[bucket]) self.buckets[bucket] = {};
		if (!self.buckets[bucket][stat]) self.buckets[bucket][stat] = [];
		self.buckets[bucket][stat].push(value);
	};

	this.getBucket = function(){
		return Math.round(new Date().getTime() / config.bucket_ms);
	};

	this.bucketToTime = function(bucket){
		return bucket * config.bucket_ms;
	};

	this.rollupBuckets = function(){

		var current = self.getBucket();

		// get all current buckets in order
		var buckets = [];
		for (var i in self.buckets) buckets.push(i);
		buckets = buckets.sort();

		for (var i=0; i<buckets.length; i++){
			var bucket = buckets[i];

			if (bucket < current){

				for (var j in self.buckets[bucket]){

					var data = self.rollupData(self.buckets[bucket][j], bucket, j);
					self.emit('data', data);
				}

				delete self.buckets[bucket];
			}
		}
	};

	this.rollupData = function(vals, bucket, stat){

		return {
			stat: stat,
			ts: self.bucketToTime(bucket),
			num: vals.length,
			foo: 'bar',
		};
	};

	setInterval(function(){
		collector.rollupBuckets();
	}, config.check_ms);
};

sys.inherits(Collector, process.EventEmitter);

function num_keys(a){
	var i=0;
	for (var j in a) i++;
	return i;
}

var collector = new Collector();

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
