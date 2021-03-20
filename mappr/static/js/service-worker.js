"use strict";

let version = 'v1:';
let appName = "mappr2"
let appLibraries = [
	// Font-Awesome
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/brands.min.css',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/solid.min.css',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/fontawesome.min.css',

	// Bootstrap
	'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-beta2/js/bootstrap.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-beta2/css/bootstrap.min.css',

	// Leaflet
	'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/leaflet.min.css',

	// Leaflet Plugins
	'https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/leaflet.fullscreen/2.0.0/Control.FullScreen.min.css',
	'https://unpkg.com/beautifymarker@1.0.9/leaflet-beautify-marker-icon.js',
	'https://unpkg.com/beautifymarker@1.0.9/leaflet-beautify-marker-icon.css',
	'https://cdnjs.cloudflare.com/ajax/libs/esri-leaflet/3.0.1/esri-leaflet.min.js',

	// Uppy
	'https://cdnjs.cloudflare.com/ajax/libs/uppy/1.26.1/uppy.min.js',
	'https://cdnjs.cloudflare.com/ajax/libs/uppy/1.26.1/uppy.min.css',

	// jQuery
	'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js',

	// Chroma
	'https://cdnjs.cloudflare.com/ajax/libs/chroma-js/2.1.1/chroma.min.js',

	// Papa
	'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

let appStatic = [
	'/static/css/styles.css',
	'/static/js/map/api.js',
	'/static/js/map/bookmarks.js',
	'/static/js/map/csv.js',
	'/static/js/map/data.js',
	'/static/js/map/history.js',
	'/static/js/map/init.js',
	'/static/js/map/map.js',
	'/static/js/map/table.js',
	'/static/js/map/ui.js',
	'/static/js/map/xyz.js'
];

let appAssets = [].concat(appLibraries, appStatic);

self.addEventListener("install", function (event) {
	self.skipWaiting();

	event.waitUntil(caches.open(version + appName).then(function (cache) {
		return cache.addAll(appAssets);
	}).then(function () {
		console.log('sw: install completed');
	}));
});

self.addEventListener("fetch", function (event) {
	console.log('sw: fetch event in progress.');

	if (event.request.method !== 'GET') {
		console.log('sw: fetch event ignored.', event.request.method, event.request.url);
		return;
	}

	event.respondWith(
		caches.match(event.request).then(function (cached) {
			let networked = fetch(event.request).then(fetchedFromNetwork, unableToResolve).catch(unableToResolve);

			console.log('sw: fetch event', cached ? '(cached)' : '(network)', event.request.url);
			return cached || networked;

			function fetchedFromNetwork(response) {
				let cacheCopy = response.clone();
				console.log('sw: fetch response from network.', event.request.url);
				caches.open(version + 'pages').then(function add(cache) {
					cache.put(event.request, cacheCopy);
				}).then(function () {
					console.log('sw: fetch response stored in cache.', event.request.url);
				});
				return response;
			}

			function unableToResolve() {
				console.log('sw: fetch request failed in both cache and network.');
				return new Response('<h1 style="font-weight:100;font-family:sans-serif;">Service Unavailable</h1>', {
					status: 503,
					statusText: 'Service Unavailable',
					headers: new Headers({
						'Content-Type': 'text/html'
					})
				});
			}
		})
	);
});

self.addEventListener("activate", function (event) {
	event.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(
				keys.filter(function (key) {
					return !key.startsWith(version);
				}).map(function (key) {
					return caches.delete(key);
				})
			);
		}).then(function () {
			console.log('sw: activate completed.');
		})
	);
});
