/*
	Handles communication with various web workers
*/

let _worker = {

	active:{},
	callbacks:{},
	logs:[],
	path: '/static/js/map_beta/workers/',

	init: function () {
		_worker.spawn('api.js');
	},

	spawn: function(filename) {
		if (filename in _worker.active) {
			return false;
		}

		_worker.active[filename] = new Worker(_worker.path + filename);

		_worker.active[filename].addEventListener('message', function(e) {
		  	console.log('Worker said: ', e.data);
		}, false);
	},

	kill: function (worker) {
		_worker.active[worker].terminate();
	},

	send: function(worker, data) {
		let body = {
			'from': 'worker-main',
			'data': data,
			'timestamp': new Date().getTime()/1000
		};

		_worker.active[worker].postMessage(body);
	}

};
