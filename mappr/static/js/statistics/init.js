let main = new Graph('main-chart');

let statistics = {

	api_base: '/statistics/api/',
	_csrf:'',

	init: async function() {
		statistics._csrf = $('#csrf_token').data('value');

		await statistics.getAvailableQueries();
	},

	getAvailableQueries: async function () {
		await fetch(
			statistics.api_base + 'networks/available',
			statistics.getMapprRequestParams('GET')
		).then(function (response) {
			return response.json();
		}).then(function(data) {
			console.log(data);
		}).catch(function(error){
			alert('Failed to get available networks');
		});
	},

	getHeaders: function() {
		return {
			'Content-Type': 'application/json',
			'X-CSRFToken': statistics._csrf
		};
	},

	getMapprRequestParams: function(method, body = {}) {
		if (method === 'GET') {
			return {
				method: method,
				headers: new Headers(statistics.getHeaders()),
				referrerPolicy: 'same-origin'
			};
		} else {
			return {
				method: method,
				mode: 'same-origin',
				cache: 'no-cache',
				credentials: 'same-origin',
				headers: new Headers(statistics.getHeaders()),
				redirect: 'error',
				referrerPolicy: 'same-origin',
				body: JSON.stringify(body)
			};
		}
	},

	postData: async function (url = '/api/statistics', data = {}) {
		if (!navigator.onLine) {
			return {
				'error': true,
				'message': 'You are not online.'
			};
		}

		const response = await fetch(
			url,
			statistics.getMapprRequestParams('POST', data)
		).catch(error => {
    		console.error('There has been a problem with your fetch operation:', error);
    		return {
				'error': true,
				'message': error
			};
  		});

		if (!response.ok) {
			return {
				'error': true,
				'message': 'Network error'
			};
    	}

		return response.json();
	},


};
