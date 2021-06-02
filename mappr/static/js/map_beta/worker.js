/*
	Handles communication with various web workers
*/

// Credit: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#open
window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"};
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;

let _worker = {

	active:{},
	callbacks:{},
	logs:[],
	path: '/static/js/map_beta/workers/',

	init: function () {
		if (!window.indexedDB) {
			alert('Your browser does not support IndexedDB which is required for Mappr to work.');
		}
		if (!window.Worker) {
			alert('Your browser does not support WebWorkers which are required for Mappr to work.');
			return;
		}
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
		_worker.send(filename, {
			'type':'set-variable',
			'name':'csrf-token',
			'value':_api.csrf
		});
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
