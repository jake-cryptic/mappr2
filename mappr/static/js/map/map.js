/*
	Handles leaflet interactions
*/

let _map = {

	getLocation: function (cb) {
		navigator.permissions.query({name:"geolocation"}).then(function(resp){
			if (resp && resp.state) {
				if (resp.state === "granted" || resp.state === "prompt") {
					navigator.geolocation.getCurrentPosition(function (position) {
						cb(position.coords.latitude, position.coords.longitude);
					});
				}
			}

			_ui.popToastMessage('No permission found to get your current location. Please allow access');
		});
	},

	icons: {

		ico: {
			main: null,
			located: null,
			csv:null
		},

		init: function () {
			let techIcon = L.Icon.extend({
				options: {
					iconSize: [25, 41],
					iconAnchor: [12.5, 41],
					popupAnchor: [0, -28]
				}
			});

			_map.icons.ico.main = new techIcon({iconUrl: 'static/img/marker-default.png'});
			_map.icons.ico.located = new techIcon({iconUrl: 'static/img/marker-located.png'});
			_map.icons.ico.csv = new techIcon({iconUrl: 'static/img/marker-csv.png'});
		}

	},

	state: {
		zoom: 10,
		defaultCoords:[52.5201508, -1.5807446],

		isNodeLoadingPaused:false,
		isNodePolygonPaused:false,

		map: null,
		map_id: "rdi",

		markers: [],
		polygons: []
	},

	moveTimer: {
		timer:null,
		duration:1000,

		clearMoveTimer:function(){
			if (_map.moveTimer.timer) clearTimeout(_map.moveTimer.timer);
			if (_api.currentRequest) {
				_api.currentRequest.abort();
				_ui.popToastMessage('Node loading has been paused due to map move', true);
			}
		},

		startMoveTimer:function(){
			_map.moveTimer.timer = setTimeout(_map.mapMove, _map.moveTimer.duration);
		},
	},

	init: function () {
		_map.state.map = L.map('map', {
			preferCanvas:true
		}).setView(_map.state.defaultCoords, _map.state.zoom);

		if (!v.loadedFromParams) {
			_map.moveToCurrentLocation();
		}
		_map.state.map.addEventListener('contextmenu', _map.mapMove);

		_map.state.map.addEventListener('movestart', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('move', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('moveend', _map.moveTimer.startMoveTimer);

		_map.changeMap(_map.state.map_id);
		_map.icons.init();
	},

	toggleNodeLoading:function(){
		_map.state.isNodeLoadingPaused = !_map.state.isNodeLoadingPaused;
		$("#node_loading_pause").text(_map.state.isNodeLoadingPaused ? "Unpause Node Loading" : "Pause Node Loading");

		v.u.updateUrl();
	},

	togglePolygonPause:function(){
		_map.state.isNodePolygonPaused = !_map.state.isNodePolygonPaused;
		$("#node_polygons_pause").text(_map.state.isNodePolygonPaused ? "Enable Node Polygons" : "Disable Node Polygons");
		_map.removeMapPolygons();
		//v.u.updateUrl();
	},

	moveToCurrentLocation: function() {
		_map.getLocation(function (lat, lon) {
			_map.state.map.setView([lat, lon], 14);
		});
	},

	setMap: function(){
		_map.changeMap($(this).val());
	},

	changeMap: function(map) {
		if (!map) map = "rdi";
		if (v.base) _map.state.map.removeLayer(v.base);

		let maps = {
			"sat": "s",
			"ter": "p",
			"tro": "t",
			"rdo": "h",
			"rdi": "m",
			"arm": "r",
			"hyb": "y"
		};

		let server = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			attr = v.attr.o;

		if (map && maps[map] && map !== "osm" && map !== "otm") {
			attr = v.attr.g;
			server = 'https://mt1.google.com/vt/lyrs=' + maps[map] + '&x={x}&y={y}&z={z}';
		}

		if (map === "otm") {
			server = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
		}

		v.base = new L.TileLayer(server, {attribution: attr + " | " + MAPPR_VER});
		_map.state.map_id = map;
		_map.state.map.addLayer(v.base);

		v.u.updateUrl();
	},

	mapMove: function (evt) {
		v.u.updateUrl();
		_map.reloadMap();
	},

	reloadMap: function() {
		if (_map.state.isNodeLoadingPaused) {
			_ui.popToastMessage("Node loading is currently paused.", true);
			return;
		}

		document.title = "Reloading Map...";
		_ui.popToastMessage("Loading map data...", false);
		_map.removeMapItems();
		_api.map.loadArea();
	},

	removeMapItems:function(){
		_map.removeMapMarkers();
		_map.removeMapPolygons();
	},

	removeMapMarkers: function() {
		for (let marker in _map.state.markers) {
			_map.state.map.removeLayer(_map.state.markers[marker]);
		}

		_map.state.markers = [];
	},

	removeMapPolygons: function(){
		for (let polygon in _map.state.polygons) {
			_map.state.map.removeLayer(_map.state.polygons[polygon]);
		}

		_map.state.polygons = [];
	},

	osm: {
		api_base:"https://nominatim.openstreetmap.org/",
		api_timeout: 15000,

		doLocationSearch:function(query) {
			$.ajax({
				url: _map.osm.api_base + "search",
				data: "q=" + query + "&format=json&limit=1" + "&callback=?",
				type: "GET",
				timeout: _map.osm.api_timeout,
				success: function(resp) {
					if (!resp[0]) {
						_ui.popToastMessage("According to OSM, that isn't a valid location.", true);
						return;
					}

					_ui.popToastMessage("You have been teleported!");
					_map.map.setView([parseFloat(resp[0].lat), parseFloat(resp[0].lon)], 14);
				},
				error: function(e) {
					if (!navigator.onLine){
						_ui.popToastMessage("You don't seem to be connected to the internet...", true);
					} else {
						_ui.popToastMessage("Error searching for location.", true);
					}
				}
			});
		},

		getApproxLocation:function(lat, lng, cb) {
			$.ajax({
				url: _map.osm.api_base + "reverse",
				data: "lat=" + lat + "&lon=" + lng + "&format=json&limit=1" + "&callback=?",
				type: "GET",
				timeout: _map.osm.api_timeout,
				success: function(resp) {
					let ret = "Address could not be found.";
					if (resp && resp.display_name) {
						ret = resp.display_name;
					}

					cb(ret);
				},
				error: function(e) {
					cb(navigator.onLine ? "API error" : "Internet connection not available.");
				}
			});
		}
	},

};
