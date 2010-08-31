var sys = require('sys');

function Collector(config){

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
		self.rollupBuckets();
	}, config.check_ms);
};

sys.inherits(Collector, process.EventEmitter);

exports.Collector = Collector;
