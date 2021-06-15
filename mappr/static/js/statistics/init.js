let main = new Graph('main-chart');

let statistics = {

	api_base: '/statistics/api/',

	init: async function() {
		await fetch(statistics.api_base + 'networks/available').then(function (response) {
			return response.json();
		}).then(function(data) {
			console.log(data);
		}).catch(function(error){
			alert('Failed to get available networks');
		});
	},

	postData: async function (url = '/api/statistics', data = {}) {
		if (!navigator.onLine) {
			return {
				'error': true,
				'message': 'You are not online.'
			};
		}

		const response = await fetch(url, {
			method: 'POST',
			mode: 'same-origin',
			cache: 'no-cache',
			credentials: 'same-origin',
			headers: new Headers({
				'Content-Type': 'application/json'
			}),
			redirect: 'error',
			referrerPolicy: 'same-origin',
			body: JSON.stringify(data)
		}).catch(error => {
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
