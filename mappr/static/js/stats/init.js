let main = new StatsChart('main-chart');

fetch('/api/statistics', {}).response();

let init = {

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
			headers: {
				'Content-Type': 'application/json'
			},
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
