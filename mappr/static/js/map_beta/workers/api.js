const worker_name = 'api.js';
let config = {
	'csrf-token':''
};

let log = function () {
	console.log('[Worker:'+worker_name+']-> ', Array.from(arguments).join(' '));
};

let respond = function(data) {
	let body = {
		'from': worker_name,
		'data': data,
		'timestamp': new Date().getTime()/1000
	};

	postMessage(body);
};

addEventListener('message', function (event) {
	let evt = event.data;

	console.log(event);

	switch (evt.data.type) {
		case 'set-variable':
			log('Set variable',evt.data.name,'to',evt.data.value);
			config[evt.data.name] = evt.data.value;
			respond({'response':'success'});
			break;
		case 'start':
			respond({'response':'success'});
			break;
		default:
			console.error('Unknown command: ' + data.command);
			break;
	}
}, false);
