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

		var all = vals.sort();
		var num = all.length;
		var lo = all[0];
		var hi = all[num-1];

		var q1 = lo;
		var q2 = lo;
		var q3 = lo;

		if (num > 1){
			var lo_c = Math.floor(num / 2);
			var hi_c = num - lo_c;

			var sum = 0;
			for (var i=0; i<num; i++) sum += all[i];

			var alo = all.slice(0, lo_c);
			var ahi = all.slice(lo_c);

			var lo_sum = 0;
			var hi_sum = 0;

			for (var i=0; i<alo.length; i++) lo_sum += alo[i];
			for (var i=0; i<ahi.length; i++) hi_sum += alo[i];

			q1 = lo_sum / lo_c;
			q2 = (lo_sum + hi_sum) / (lo_c + hi_c);
			q3 = hi_sum / hi_c;
		}

		return {
			stat: stat,
			ts: self.bucketToTime(bucket),
			num: num,
			lo: lo,
			q1: q1,
			q2: q2,
			q3: q3,
			hi: hi,
		};
	};

	setInterval(function(){
		self.rollupBuckets();
	}, config.check_ms);
};

sys.inherits(Collector, process.EventEmitter);

exports.Collector = Collector;
