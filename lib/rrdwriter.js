var sys = require('sys');
var fs = require('fs');
var child_process = require('child_process');

function RRDWriter(config){

	var self = this;

	this.file_cache = {};
	this.config = config;

	this.store = function(data){

		// get the field list first
		var fields = self.getFields(data.mode);
		if (!fields.length){
			console.log('ERROR couldn\'t get fields for data');
			return;
		}

		var filename = self.config.rrd_root + '/' + data.stat + '.rrd';

		// this function will write the actual values to the file.
		// we may need to do it later, once the file has been created
		var write = function(){

			var out = [Math.round(data.ts / 1000)];
			for (var i=0; i<fields.length; i++) out.push(Math.round(data[fields[i]]));
			out = out.join(':');

			var command = [self.config.rrdtool, 'update', filename, out];

			child_process.exec(command.join(' '), function(error, stdout, stderr){
				if (error != null){
					console.log('[ERROR] unable to store RRD data: '+error);
				}
			});
		}


		// create file if needed
		if (!self.fileExists(filename)){
			self.createFile(filename, fields, write);
			return;
		}

		write();
	};

	this.fileExists = function(path){

		if (self.file_cache[path]) return true;

		try {
			var stat = fs.statSync(path);
			self.file_cache[path] = true;
			return true;
		} catch(e){
			return false;
		}
	};

	this.getFields = function(mode){

		// return a list of fields to store
		if (mode == 'avg_per') return ['num', 'lo', 'hi', 'hi_trim', 'avg'];
		if (mode == 'simple') return ['pass', 'fail', 'total'];
		return [];
	};

	this.createFile = function(filename, fields, callback){

		var time = new Date().getTime();
		time = Math.round(time / 1000);

		var args = [self.config.rrdtool, 'create', filename];
		args.push('--step 10');
		args.push('--start '+time);

		for (var i=0; i<fields.length; i++){
			args.push('DS:'+fields[i]+':GAUGE:10:0:U');
		}

		args.push('RRA:AVERAGE:0.5:1:8640');	// 24 hours at 1 sample per 10 secs
		args.push('RRA:AVERAGE:0.5:90:2880');	// 1 month at 1 sample per 15 mins
		args.push('RRA:AVERAGE:0.5:2880:5475');	// 5 years at 1 sample per 8 hours

		child_process.exec(args.join(' '), function(error, stdout, stderr){

			if (error != null){
				console.log('[ERROR] failed to create RRD: '+error);
			}else{
				callback();
			}
		});
	};
}

sys.inherits(RRDWriter, process.EventEmitter);

exports.RRDWriter = RRDWriter;
