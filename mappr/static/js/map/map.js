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
		popupOptions: true,

		boringColours:false,
		colorLightness:'keep',

		markerCluster: false,
		useCircleMarkers: false
	},

	colours: {
		confirmed:'#1a1a1a', // #1a1a1a or #1ac400
		estimated:'#0099ff', // #0099ff or #ff1328

		csv_file:'#ff11e9'
	},

	attr: {
		g: '<a href="https://maps.google.co.uk">Google Maps</a>',
		o: '<a href="https://openstreetmap.org">OpenStreetMap</a>'
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

			let biMain = L.BeautifyIcon.icon({
				icon:'far fa-circle icon-class',
				shadowSize: [0,0],
				iconShape:'marker',
				borderColor:'#fff',
				borderWidth:1,
				backgroundColor:_map.colours.estimated,
				textColor:'#fff'
			});
			_map.icons.ico.main = biMain;

			let biLocated = L.BeautifyIcon.icon({
				icon:'far fa-circle icon-class',
				shadowSize: [0,0],
				iconShape:'marker',
				borderColor:'#fff',
				borderWidth:1,
				backgroundColor:_map.colours.confirmed,
				textColor:'#fff'
			});
			_map.icons.ico.located = biLocated;

			let biCsv = L.BeautifyIcon.icon({
				icon:'far fa-circle icon-class',
				shadowSize: [0,0],
				iconShape:'marker',
				borderColor:'#fff',
				borderWidth:1,
				backgroundColor:_map.colours.csv_file,
				textColor:'#fff'
			});
			_map.icons.ico.csv = biCsv;
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

		markerLayer: null,

		updateMap:function(){
			// Draw items on the map
			_map.items.drawPolygons();
			_map.items.drawMarkers();
		},

		drawMarkers: function() {
			_map.items.markers.forEach(function (marker) {
				_map.items.markerLayer.addLayer(marker);
			});

			if (_map.settings.markerCluster === true) {
				_map.state.map.addLayer(_map.state.markers);
			}
		},

		drawPolygons: function() {
			if (_map.state.isNodePolygonPaused === true) return;

			_map.items.polygons.forEach(function (polygon) {
				_map.state.map.addLayer(polygon);
			});
		},

		toggleNodeLoading:function(){
			_map.state.isNodeLoadingPaused = !_map.state.isNodeLoadingPaused;
			_ui.controls.setNodeLoadingState();
			_history.updateUrl();
		},

		togglePolygonPause:function(){
			console.log('Setting polygon pause to: ', !_map.state.isNodePolygonPaused);
			_map.state.isNodePolygonPaused = !_map.state.isNodePolygonPaused;
			_ui.controls.setPolygonPauseState();

			// Remove / re-draw polygons depending on variable
			if (_map.state.isNodePolygonPaused === true) {
				_map.items.removeMapPolygons(false);
			} else {
				_map.items.drawPolygons();
			}

			// Disable marker cluster if user wants to enable polygons
			if (_map.settings.markerCluster === true && _map.state.isNodePolygonPaused === false) {
				_map.items.toggleMarkerCluster();
			}
		},

		toggleMarkerCluster:function(){
			console.log('Setting marker cluster to: ', !_map.settings.markerCluster);
			_map.settings.markerCluster = !_map.settings.markerCluster;

			_map.items.removeMapMarkers(false);
			if (_map.settings.markerCluster === true) {
				// Disable polygons on marker cluster map
				if (_map.state.isNodePolygonPaused !== true) {
					_map.items.togglePolygonPause();
				}

				_ui.popToastMessage('Markers will now cluster', 1000, true, 'info');
				_map.items.markerLayer = _map.state.markers;
			} else {
				_ui.popToastMessage('Markers will no longer cluster', 1000, true, 'info');
				_map.items.markerLayer = _map.state.map;
			}

			_ui.controls.setMarkerClusterState();
			_map.items.updateMap();
		},

		removeMapItems:function(){
			_map.items.removeMapMarkers();
			_map.items.removeMapPolygons();
		},

		// TODO: Don't clear markers on map move if they are staying in viewport
		removeMapMarkers: function(clean = true) {
			for (let marker in _map.items.markers) {
				_map.items.markerLayer.removeLayer(_map.items.markers[marker]);
			}

			if (clean === true) _map.items.markers = [];
		},

		removeMapPolygons: function(clean = true){
			for (let polygon in _map.items.polygons) {
				_map.state.map.removeLayer(_map.items.polygons[polygon]);
			}

			if (clean === true) _map.items.polygons = [];
		},

		createCircleMarker: function(lat, lng, point, popupText, tooltipText) {
			function getCircleMarkerOptions(point) {
				return {
					mcc:point.mcc,
					mnc:point.mnc,
					enb:point.node_id,
					draggable:true,
					autoPan:true,
					color:(point.user_id ? _map.colours.confirmed : _map.colours.estimated),
					fillOpacity:0.8,
					weight:5,
					radius:9
				};
			}

			let tooltipOptions = copy(_map.items.markerTooltipOptions);
			tooltipOptions.offset = [0, 9];

			return new L.CircleMarker(
				[lat, lng],
				getCircleMarkerOptions(point)
			).bindPopup(
				popupText, _map.items.markerPopupOptions
			).bindTooltip(
				tooltipText, tooltipOptions
			).on('moveend', _map.attemptMove)
		},

		createMarker: function(lat, lng, point, popupText, tooltipText) {
			if (_map.settings.useCircleMarkers === true) {
				return _map.items.createCircleMarker(lat, lng, point, popupText, tooltipText);
			}

			function getMarkerOptions(point) {
				return {
					mcc:point.mcc,
					mnc:point.mnc,
					enb:point.node_id,
					draggable:true,
					autoPan:true,
					icon: (point.user_id ? _map.icons.ico.located : _map.icons.ico.main)
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

		pushMarker: function(lat, lng, point, popupText) {
			let tooltipText = _map.getTooltipText(point);

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
		maxZoom: 20,
		zoom: 10,
		defaultCoords:[52.5201508, -1.5807446],

		isNodeLoadingPaused:false,
		isNodePolygonPaused:false,

		base: null,
		map: null,
		markers: null,
		map_id: "rdi"
	},

	moveTimer: {
		timer:null,
		duration:1250,

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

	leafletHacks: function () {
		// Thanks to: https://github.com/Leaflet/Leaflet/issues/1324#issuecomment-384697787
		L.Marker.addInitHook(function() {
			if (!this.options.virtual) return;

			// setup virtualization after marker was added
			this.on('add', function() {
				this._updateIconVisibility = function() {
					var map = this._map,
						isVisible = map.getBounds().contains(this.getLatLng()),
						wasVisible = this._wasVisible,
						icon = this._icon,
						iconParent = this._iconParent,
						shadow = this._shadow,
						shadowParent = this._shadowParent;

					// remember parent of icon
					if (!iconParent) {
						iconParent = this._iconParent = icon.parentNode;
					}
					if (shadow && !shadowParent) {
						shadowParent = this._shadowParent = shadow.parentNode;
					}

					// add/remove from DOM on change
					if (isVisible != wasVisible) {
						if (isVisible) {
							iconParent.appendChild(icon);
							if (shadow) {
								shadowParent.appendChild(shadow);
							}
						} else {
							iconParent.removeChild(icon);
							if (shadow) {
								shadowParent.removeChild(shadow);
							}
						}

						this._wasVisible = isVisible;

					}
				};

				// on map size change, remove/add icon from/to DOM
				this._map.on('resize moveend zoomend', this._updateIconVisibility, this);
				this._updateIconVisibility();

			}, this);
		});
	},

	init: function () {
		// Apply some hacks
		_map.leafletHacks();

		// Create the map
		_map.state.map = L.map('map', {
		  	fullscreenControl: true,
			fullscreenControlOptions: {
				position: 'topleft'
		  	},

			preferCanvas: true
		}).setView(_map.state.defaultCoords, _map.state.zoom);

		L.control.scale().addTo(_map.state.map);

		if (!_history.loadedFromParams) {
			_map.moveToCurrentLocation();
		}
		_map.state.map.addEventListener('contextmenu', _map.mapMove);

		_map.state.map.addEventListener('movestart', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('move', _map.moveTimer.clearMoveTimer);
		_map.state.map.addEventListener('moveend', _map.moveTimer.startMoveTimer);

		_map.changeMap(_map.state.map_id);
		_map.icons.init();

		_map.state.markers = L.markerClusterGroup();
		// _map.state.canvasLayer = L.canvasIconLayer({}).addTo(_map.state.map)
		_map.items.markerLayer = _map.state.map;

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

	setMap: function() {
		let baseMap = $(this).val();
		_api.track(['trackEvent', 'MapControl', 'base_map_change ' + baseMap]);
		_map.changeMap(baseMap);
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
			server = 'https://mt1.google.com/vt/lyrs=' + maps[map] + '&x={x}&y={y}&z={z}&hl=en';
		}

		if (map === "otm") {
			server = "https://tile.opentopomap.org/{z}/{x}/{y}.png";
		}

		_map.state.base = new L.TileLayer(server,
			{
				attribution: attr + " | " + MAPPR_VER,
				maxNativeZoom: 18,
				maxZoom: _map.state.maxZoom
			}
		);
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
		_ui.popToastMessage("Loading map data...", 400, true, 'secondary');
		_map.items.removeMapItems();
		_api.map.loadArea();
	},

	attemptMove:function(evt){
		if (!evt) return;

		_api.nodeUpdate.move_attempt = {
			rat:_app.rat,
			mcc:evt.target.options.mcc,
			mnc:evt.target.options.mnc,
			node_id:evt.target.options.enb,
			lat:evt.target._latlng.lat,
			lng:evt.target._latlng.lng
		};

		_ui.popToastAction("Are you sure you wish to move this node?", "Yes", "No", function(){
			_ui.burnToastAction();
			_api.nodeUpdate.sendMove();
			_api.track(['trackEvent', 'NodeLocation', 'user_move ' + _api.nodeUpdate.move_attempt.mcc + '-' + _api.nodeUpdate.move_attempt.mnc + '-' + _api.nodeUpdate.move_attempt.node_id]);
		});
	},

	getSectorColor: function (mnc, enb,sector) {
		let sectorId = mnc.toString();

		if (!_map.settings.boringColours) {
			let sectorName = _data[_app.mcc]['providers'][mnc]['sectorInfo'](enb, [sector]);
			sectorId+= sectorName;
		}
		let sectorMD5 = MD5(sectorId);
		let sectorColor = chroma('#' + sectorMD5.substring(0, 6));
		if (_map.settings.colorLightness === 'brighten') {
			sectorColor = sectorColor.brighten();
		} else if (_map.settings.colorLightness === 'darken') {
			sectorColor = sectorColor.darken();
		}

		return sectorColor.hex();
	},

	addData:function (data){
		for (let i = 0; i < data.length; i++) {
			_map.addPointToMap(data[i]);
		}

		// Display items on map
		_map.items.updateMap();
	},

	getTooltipText: function(point) {
		let html = '<strong>' + point.node_id + '</strong>';

		if (_app.mnc === 0) {
			html += ' <strong>(' + point.mnc + ')</strong>';
			//html += '<br /><small>' + point.mcc + '-' + point.mnc + '</small><br />';
		}

		html += '<br />';

		let sectorIds = Object.keys(point.sectors);
		let sectorInfo = _map.sectorInfo(point.mnc, point.node_id, sectorIds);
		if (sectorInfo !== '') {
			html += sectorInfo;
		}

		return html;
	},

	sectorInfo: function (mnc, enb, sectors) {
		let provider = _data[_app.mcc]['providers'][mnc];

		if (!provider || !provider['sectorInfo']) {
			return 'Error';
		}

		return provider['sectorInfo'](enb, sectors);
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

		let dates = "<div class='mb-2'><strong>Created: </strong>" + getDateTimeString(point.created) + "<br />";
			dates += "<strong>Updated: </strong>" + getDateTimeString(point.updated) + "<br />";
			dates += "<strong>Samples: </strong>" + point.samples + "</div>";

		t += dates;

		if (_map.settings.popupLinks === true) {
			t += '\
			<div class="container container-fluid">\
				<div class="site_approx_addr btn-group btn-group-sm" role="group" aria-label="eNB Options">\
					<button type="button" class="btn btn-outline-dark" onclick="_ui.getSiteAddr(this,' + lat + ',' + lng + ')">Address</button>\
					<button type="button" class="btn btn-outline-primary btn-sm" onclick="_ui.getSiteHistory(this,' + point.mcc + ',' + point.mnc + ',' + point.node_id + ')">History</button>\
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

			let color = _map.getSectorColor(point.mnc, point.enb, s);
			let dates = "Created: " + getDateStringUtc(sector[2]) + "\n";
				dates += "Updated: " + getDateStringUtc(sector[3]) + "\n";

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
		//if (_api.users.getUserFromId(point.verified)){
		//	txt += '<br />Located by: ' + _api.users.getUserFromId(point.verified);
		//}
		_map.items.pushMarker(tLat, tLng, point, txt);
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
