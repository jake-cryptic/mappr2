let respond = function(data) {
	let body = {
		'from': 'worker',
		'data': data,
		'timestamp': new Date().getTime()/1000
	};

	postMessage(body);
};

addEventListener('message', function (event) {
	let evt = event.data;

	console.log(event);

	switch (evt.data.command) {
		case 'start':
			postMessage({

			});
			break;
		default:
			console.error('Unknown command: ' + data.command);
			break;
	}
}, false);
