var _paq = window._paq = window._paq || [];

let _mappr = {

	dev: window.location.host === 'localhost:5000',
	sw: null,

	init: function(){
		if (!_mappr.dev) {
			_mappr.initMatomo();
		} else {
			_mappr.initServiceWorker();
		}
	},

	initMatomo: function () {
		/* tracker methods like "setCustomDimension" should be called before "trackPageView" */
		_paq.push(['trackPageView']);
		_paq.push(['enableLinkTracking']);

		(function () {
			var u = "https://analytics.mappr.uk/matomo/";
			_paq.push(['setTrackerUrl', u + 'matomo.php']);
			_paq.push(['setSiteId', '1']);
			var d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
			g.type = 'text/javascript';
			g.async = true;
			g.src = u + 'matomo.js';
			s.parentNode.insertBefore(g, s);
		})();
	},

	initServiceWorker: function () {
		if (!('serviceWorker' in navigator)) return false;

		_mappr.sw = navigator.serviceWorker.register('/static/js/service-worker.js').then(function(registration){
			console.log('ServiceWorker registration successful with scope: ',registration.scope);
		},function(err){
			console.log('ServiceWorker registration failed: ',err);
		});
	}

};

_mappr.init();
