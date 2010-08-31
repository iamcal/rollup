var sys = require('sys');

function Collector(config){

	var self = this;

	this.config = config;
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

		var all = vals.sort();
		var num = all.length;
		var lo = all[0];
		var hi = all[num-1];

		var hi_trim = lo;
		var avg = lo;

		if (num > 1){
			// first, trim the top few percent
			var trim_count = Math.round((self.config.trim_top / 100) * num);
			var all = all.slice(0, all.length-trim_count);
			hi_trim = all[all.length-1];

			// now get the average of the remaining data
			var sum = 0;
			for (var i=0; i<all.length; i++) sum += all[i];
			var avg = sum / all.length;
		}

		return {
			stat: stat,
			ts: self.bucketToTime(bucket),
			num: num,
			lo: lo,
			avg: avg,
			hi_trim: hi_trim,
			hi: hi,
		};
	};

	setInterval(function(){
		self.rollupBuckets();
	}, config.check_ms);
};

sys.inherits(Collector, process.EventEmitter);

exports.Collector = Collector;
