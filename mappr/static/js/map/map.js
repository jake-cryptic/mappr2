/*
	Handles leaflet interactions
*/

let _map = {

	getLocation: function (cb) {
		navigator.permissions.query({
			name:"geolocation"
		}).then(function(resp){
			if (resp && resp.state) {
				if (resp.state === "granted" || resp.state === "prompt") {
					console.info('Geolocation permission granted!');
					navigator.geolocation.getCurrentPosition(function (position) {
						cb(position.coords.latitude, position.coords.longitude);
					});
				} else {
					console.warn('Geolocation permission denied!');
				}
			}

			_ui.popToastMessage('No permission found to get your current location. Please allow access');
		});
	},

	settings: {
		popupCoords: true,
		popupLinks: true,
		popupOptions: true
	},

	attr: {
		g: '<a href="https://maps.google.co.uk">Google Maps</a>',
		o: '<a href="http://openstreetmap.org">OpenStreetMap</a>'
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

			let newicon = L.BeautifyIcon.icon({
				icon:'far fa-circle icon-class',
				shadowSize: [0,0],
				iconShape:'marker',
				borderColor:'#fff',
				borderWidth:1,
				backgroundColor:'#0099ff',
				textColor:'#fff'
			});
			_map.icons.ico.main = newicon;
		}

	},

	items: {

		markerPopupOptions: {
			maxWidth: (screen.availWidth >= 600 ? 600 : screen.availWidth),
			className: 'site_popup'
		},

		markerTooltipOptions: {
			permanent: true,
			direction: 'bottom',
			className: 'marker_label'
		},

		markers: [],
		polygons: [],

		updateMap:function(){
			// Draw items on the map
			_map.items.markers.forEach(function (marker) {
				_map.state.map.addLayer(marker);
			});
			_map.items.polygons.forEach(function (polygon) {
				_map.state.map.addLayer(polygon);
			});
		},

		// TODO: Consider moving this to UI.js
		toggleNodeLoading:function(){
			_map.state.isNodeLoadingPaused = !_map.state.isNodeLoadingPaused;
			$("#node_loading_pause").text(_map.state.isNodeLoadingPaused ? "Unpause Node Loading" : "Pause Node Loading");

			_history.updateUrl();
		},

		togglePolygonPause:function(){
			_map.state.isNodePolygonPaused = !_map.state.isNodePolygonPaused;
			$("#node_polygons_pause").text(_map.state.isNodePolygonPaused ? "Enable Node Polygons" : "Disable Node Polygons");
			_map.items.removeMapPolygons();
			//_history.updateUrl();
		},

		removeMapItems:function(){
			_map.items.removeMapMarkers();
			_map.items.removeMapPolygons();
		},

		// TODO: Don't clear markers on map move if they are staying in viewport
		removeMapMarkers: function() {
			for (let marker in _map.items.markers) {
				_map.state.map.removeLayer(_map.items.markers[marker]);
			}

			_map.items.markers = [];
		},

		removeMapPolygons: function(){
			for (let polygon in _map.items.polygons) {
				_map.state.map.removeLayer(_map.items.polygons[polygon]);
			}

			_map.items.polygons = [];
		},

		createMarker: function(lat, lng, point, popupText, tooltipText) {
			function getMarkerOptions(point) {
				return {
					mcc:point.mcc,
					mnc:point.mnc,
					enb:point.node_id,
					draggable:true,
					autoPan:true,
					icon: (point.verified ? _map.icons.ico.located : _map.icons.ico.main)
				};
			}

			return new L.marker(
				[lat, lng],
				getMarkerOptions(point)
			).bindPopup(
				popupText, _map.items.markerPopupOptions
			).bindTooltip(
				tooltipText, _map.items.markerTooltipOptions
			).on('moveend', _map.attemptMove)
		},

		pushMarker: function(lat, lng, point, popupText, tooltipText) {
			_map.items.markers.push(
				_map.items.createMarker(lat, lng, point, popupText, tooltipText)
			);
		},

		pushPolygon: function (nodeCoords, sectorCoords, color) {
			_map.items.polygons.push(
				L.polygon(
					[nodeCoords, sectorCoords],
					{
						color: color
					}
				)
			);
		}
	},

	state: {
		zoom: 10,
		defaultCoords:[52.5201508, -1.5807446],

		isNodeLoadingPaused:false,
		isNodePolygonPaused:false,

		base: null,
		map: null,
		map_id: "rdi"
	},

	moveTimer: {
		timer:null,
		duration:1000,

		clearMoveTimer:function(){
			if (_map.moveTimer.timer) {
				clearTimeout(_map.moveTimer.timer);
			}
			if (_api.currentRequest) {
				_api.currentRequest.abort();
			}
		},

		startMoveTimer:function(){
			_map.moveTimer.timer = setTimeout(_map.mapMove, _map.moveTimer.duration);
		},
	},

	init: function () {
		_map.state.map = L.map('map', {
		  	fullscreenControl: true,
			fullscreenControlOptions: {
				position: 'topleft'
		  	},
			preferCanvas:true
		}).setView(_map.state.defaultCoords, _map.state.zoom);

		if (!_history.loadedFromParams) {
			_map.moveToCurrentLocation();
		}
		_map.state.map.addEventListener('contextmenu', _map.mapMove);

		_map.state.map.addEventListener('movestart', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('move', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('moveend', _map.moveTimer.startMoveTimer);

		_map.changeMap(_map.state.map_id);
		_map.icons.init();

		console.log('[Map]-> Initialised');
	},

	watch: {

		id: null,

		options: {
		  	enableHighAccuracy: false,
		  	timeout: 5000,
			maximumAge: 0
		},

		init:function() {
			_map.watch.id = navigator.geolocation.watchPosition(
				_map.watch.update,
				_map.watch.error,
				_map.watch.options
			);
		},

		toggle: function (){

		},

		update:function(pos) {
			let coords = pos.coords;

			_map.setLocation(coords.latitude, coords.longitude, 15);
		},

		error: function (err) {
			console.warn(err);
			_ui.popToastMessage('Failed to start geolocation watch');
		},

		stop: function() {
			navigator.geolocation.clearWatch(_map.watch.id);
			_map.watch.id = null;
		}

	},

	setLocation:function(lat, lng, zoom = 14){
		_map.state.map.setView([
			parseFloat(lat),
			parseFloat(lng)
		], zoom);
	},

	moveToCurrentLocation: function() {
		_map.getLocation(function (lat, lng) {
			_map.setLocation(lat, lng, 14)
		});
	},

	goToHereData:function(){
		let lat = $(this).data("lat");
		let lng = $(this).data("lng");
		let zoom = $(this).data("zoom") || 16;

		_map.setLocation(lat, lng, zoom);
	},

	getMapXyz: function(){
		let loc = _map.state.map.getCenter();
		let zoom = _map.state.map.getZoom();
		return {
			'lat': loc.lat,
			'lng': loc.lng,
			'zoom': zoom
		};
	},

	setMap: function(){
		_map.changeMap($(this).val());
	},

	changeMap: function(map) {
		if (!map) map = "rdi";
		if (_map.state.base) _map.state.map.removeLayer(_map.state.base);

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
			attr = _map.attr.o;

		if (map && maps[map] && map !== "osm" && map !== "otm") {
			attr = _map.attr.g;
			server = 'https://mt1.google.com/vt/lyrs=' + maps[map] + '&x={x}&y={y}&z={z}';
		}

		if (map === "otm") {
			server = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
		}

		_map.state.base = new L.TileLayer(server, {attribution: attr + " | " + MAPPR_VER});
		_map.state.map_id = map;
		_map.state.map.addLayer(_map.state.base);

		_history.updateUrl();
	},

	mapMove: function (evt) {
		_history.updateUrl();
		_map.reloadMap();
	},

	reloadMap: function() {
		if (_map.state.isNodeLoadingPaused) {
			_ui.popToastMessage("Node loading is currently paused.", 2000, true);
			return;
		}

		document.title = "Reloading Map...";
		_ui.popToastMessage("Loading map data...", 1000, true);
		_map.items.removeMapItems();
		_api.map.loadArea();
	},

	attemptMove:function(evt){
		if (!evt) return;

		_api.nodeUpdate.move_attempt = {
			rat:_app.rat,
			mcc:evt.target.options.mcc,
			mnc:evt.target.options.mnc,
			enb:evt.target.options.enb,
			lat:evt.target._latlng.lat,
			lng:evt.target._latlng.lng
		};

		_ui.popToastAction("Are you sure you wish to move this node?", "Yes", "No", function(){
			_ui.burnToastAction();
			_api.nodeUpdate.sendMove();
		});
	},

	getSectorColor: function (mnc, sector) {
		//let sectorName = v.sData[mnc][sector];
		let sectorId = mnc.toString(); // + sectorName;
		let sectorMD5 = MD5(sectorId);

		return '#' + sectorMD5.substring(0, 6);
	},

	addData:function (data){
		for (let i = 0; i < data.length; i++) {
			_map.addPointToMap(data[i]);
		}

		// Display items on map
		_map.items.updateMap();
	},

	// TODO: Refactor this
	getTooltipText: function(point) {
		let html = '<strong>' + point.node_id + '</strong><br />';

		let sectorIds = Object.keys(point.sectors);
		let sectorInfo = _map.sectorInfo(point.mnc, point.node_id, sectorIds);
		if (sectorInfo !== '') {
			html += sectorInfo;
		}

		return html;
	},

	sectorInfo: function (mnc, enb, sectors) {
		let ret = '';
		switch (mnc) {
			case 10:
				if (findItem(sectors, [115, 125, 135, 145, 155, 165])) ret += (enb >= 500000 ? '1 ' : '40C1 ');
				if (findItem(sectors, [114, 124, 134, 144, 154, 164])) ret += (enb >= 500000 ? '3 ' : '1 ');
				if (findItem(sectors, [110, 120, 130, 140, 150, 160])) ret += '20 ';
				if (findItem(sectors, [112, 122, 132])) ret += '8 ';
				if (findItem(sectors, [116, 126, 136, 146, 156, 166])) ret += (enb >= 500000 ? '40C1 ' : '3 ');
				if (findItem(sectors, [117, 127, 137, 147, 157, 167])) ret += '40C2';
				break;
			case 15:
				if (findItem(sectors, [15, 25, 35, 45, 55, 65])) ret += (enb >= 500000 ? '1 ' : '?');
				if (findItem(sectors, [14, 24, 34, 44, 54, 64])) ret += '1 ';
				if (findItem(sectors, [16, 26, 36, 46, 56, 66])) ret += '3 ';
				if (findItem(sectors, [18, 28, 38, 48, 58, 68])) ret += '7 ';
				if (findItem(sectors, [12, 22, 32])) ret += '8 ';
				if (findItem(sectors, [10, 20, 30, 40, 50, 60])) ret += '20 ';
				if (findItem(sectors, [19, 29, 39, 49, 59, 69])) ret += '38';
				break;
			case 20:
				if (findItem(sectors, [71, 72, 73, 74, 75, 76])) ret += '1 ';
				if (findItem(sectors, [0, 1, 2, 3, 4, 5])) ret += '3 ';
				if (findItem(sectors, [16])) ret += '3SC ';
				if (findItem(sectors, [6, 7, 8])) ret += '20';
				break;
			case 30:
				if (findItem(sectors, [21, 24])) ret += 'Small Cell';
				if (findItem(sectors, [18, 19, 20])) ret += '1 ';
				if (findItem(sectors, [15, 16, 17])) ret += '7T ';
				if (findItem(sectors, [0, 1, 2])) ret += '3P ';
				if (findItem(sectors, [3, 4, 5])) ret += '3S ';
				if (findItem(sectors, [6, 7, 8])) ret += '7P ';
				if (findItem(sectors, [9, 10, 11])) ret += '7S ';
				if (findItem(sectors, [12, 13, 14])) ret += '20';
				break;
			default:
				break;
		}

		return ret;
	},

	getPopupText: function (point) {
		let lat = point.lat, lng = point.lng;
		let t = '<span class="site_popup_title mb-2">' + point.node_id + '</span>';

		if (_map.settings.popupCoords === true) {
			t += '<input class="form-control text-center form-control-sm mb-2" type="text" readonly value="' + round(lat, 7) + ', ' + round(lng,7) + '" />';
		}

		if (_map.settings.popupLinks === true) {
			t += '\
			<span class="site_popup_links mb-2">\
				<a href="' + getGmapsUrl(lat, lng) + '" target="_blank">Google Maps</a> | \
				<a href="' + getOsmUrl(lat, lng) + '" target="_blank">OSM</a> | \
				<a href="' + getCellMapperUrl(point.mcc, point.mnc, lat, lng) + '" target="_blank">CellMapper</a>\
			</span>';
		}

		let dates = "<div class='mb-2'><strong>Created:</strong>" + getDateTimeString(point.created) + "<br />";
			dates += "<strong>Updated: </strong>" + getDateTimeString(point.updated) + "</div>";

		t += dates;

		if (_map.settings.popupLinks === true) {
			t += '\
			<div class="container container-fluid">\
				<div class="site_approx_addr btn-group btn-group-sm" role="group" aria-label="eNB Options">\
					<button type="button" class="btn btn-outline-dark" onclick="_ui.getSiteAddr(this,' + lat + ',' + lng + ')">Address</button>\
					<button type="button" class="btn btn-outline-primary btn-sm" onclick="_ui.getSiteHistory(this,' + point.mcc + ',' + point.mnc + ',' + point.enb + ')">History</button>\
				</div>\
			</div>';
		}

		return t;
	},

	// TODO: Refactor this as well...
	addPointToMap: function (point) {
		let tLat = round(point.lat, 7),
			tLng = round(point.lng, 7);

		let txt = _map.getPopupText(point);

		txt += "<div class='sect_block'>";
		for (let s in point.sectors) {
			let sector = point.sectors[s];

			let color = _map.getSectorColor(point.mnc, s);
			let dates = "First Seen: " + getDateStringUtc(sector[2]) + "\n";
				dates += "Last Seen: " + getDateStringUtc(sector[3]) + "\n";

			txt += "<span class='sect' style='background-color:" + color + "' title='" + dates + "'>" + s + "</span>";

			if (!_map.items.isNodePolygonPaused) {
				_map.items.pushPolygon(
					[tLat, tLng],
					[sector[0], sector[1]],
					color
				);
			}
		}
		txt += "</div>";

		// TODO: Add user location verification
		//if (v.user.list[point.verified]){
		//	txt += '<br />Located by: ' + v.user.list[point.verified];
		//}

		let tooltipText = _map.getTooltipText(point);
		_map.items.pushMarker(tLat, tLng, point, txt, tooltipText);
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
					_map.setLocation(resp[0].lat, resp[0].lon, 14);
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
