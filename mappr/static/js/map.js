const O2_TMS_BASE = "https://68aa7b45-tiles.spatialbuzz.net/tiles/o2_uk-";
const O2_TMS_VER = 167;
//const EE_TMS_BASE = "https://maps.ee.co.uk//geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const EE_TMS_BASE = "https://coverage.ee.co.uk/geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const THREE_TMS_BASE = "http://www.three.co.uk/static/images/functional_apps/coverage/";
const CM_TMS_BASE = "https://api.cellmapper.net/v6/getTile?MCC=234&MNC=";

const MAPPR_VER = "mappr-v-0.1.0";

let v = {
	mLimit: 5000,
	sLimit: 36,

	loadedFromParams:false,

	showVerified:true,
	showMls:true,

	mno: 0,
	mcc: 234,

	current_request:null,

	markers: [],
	polygons: [],

	attr: {
		g: '<a href="https://maps.google.co.uk">Google Maps</a>',
		o: '<a href="http://openstreetmap.org">OpenStreetMap</a>'
	},

	mncData: {},

	sData: {
		10: JSON.parse('{"110":"L08","114":"L18","115":"L21","116":"L23-C1","117":"L23-C2","120":"L08","124":"L18","125":"L21","126":"L23-C1","127":"L23-C2","130":"L08","134":"L18","135":"L21","136":"L23-C1","137":"L23-C2","140":"L08","144":"L18","145":"L21","146":"L23-C1","147":"L23-C2","150":"L08","154":"L18","155":"L21","156":"L23-C1","157":"L23-C2","160":"L08","164":"L18","165":"L21","166":"L23-C1","167":"L23-C2"}'),
		15: JSON.parse('{"10":"L08","12":"L09","14":"L21","15":"L21","16":"L18","18":"L26","19":"L26T","20":"L08","22":"L09","24":"L21","25":"L21","26":"L18","28":"L26","29":"L26T","30":"L08","32":"L09","34":"L21","35":"L21","36":"L18","38":"L26","39":"L26T","40":"L08","44":"L21","46":"L18","48":"L26","50":"L08","54":"L21","56":"L18","58":"L26","60":"L08","64":"L21","66":"L18","68":"L26"}'),
		20: JSON.parse('{"0":"L18","1":"L18","2":"L18","3":"L18","4":"L18","5":"L18","6":"L08","7":"L08","8":"L08","71":"L21","72":"L21","73":"L21","74":"L21","75":"L21","76":"L21"}'),
		30: JSON.parse('{"0":"L18","1":"L18","2":"L18","3":"L18-C2","4":"L18-C2","5":"L18-C2","6":"L26-C1","7":"L26-C1","8":"L26-C1","9":"L26-C2","10":"L26-C2","11":"L26-C2","12":"L08","13":"L08","14":"L08","15":"L26-C3","16":"L26-C3","17":"L26-C3","18":"L21","19":"L21","20":"L21","24":"?"}'),
		55: {},
		58: {}
	},

	init: function () {
		document.title = "Loading Map...";
		v.m.init();
		v.assignEvents();
		v.getMncData();
	},

	getLocation: function (cb) {
		navigator.permissions.query({name:"geolocation"}).then(function(resp){
			if (resp && resp.state) {
				if (resp.state === "granted" || resp.state === "prompt") {
					navigator.geolocation.getCurrentPosition(function (position) {
						cb(position.coords.latitude, position.coords.longitude);
					});
				}
			}

			v.ui.popToastMessage('No permission found to get your current location. Please allow access');
		});
	},

	sidebar: {
		activeTab:"map_settings",

		assignEvents:function() {
			v.mno_tiles.append_html();

			$("#" + v.sidebar.activeTab).show();
			$("[data-sidebartab]").each(function(){
				$(this).on("click enter", function(){
					$("a.active.nav-link").removeClass("active");
					$(this).addClass("active");
					v.sidebar.switchTab($(this).data("sidebartab"));
				});
			});

			$("#sidebar_toggle").on("click enter", v.sidebar.toggleView);

			$("#adv_map_show_mls, #adv_map_show_verified").on("change", v.sidebar.toggleDbResults);

			$("#do_world_location_search").on("click enter", function(){
				v.osm.doLocationSearch($("#world_location_search").val());
			});
			$("#world_location_search").on("keypress", function(evt){
				if (evt.keyCode === 13) v.osm.doLocationSearch($("#world_location_search").val());
			});
		},

		toggleView:function(){
			if (window.innerWidth > 768) {
				if ($("#sidebar").is(":visible")) {
					$("#sidebar").hide();
					$("#map").css("width", "100%");
				} else {
					$("#sidebar").show();
					$("#map").css("width", "80%");
				}
			} else {
				$("#sidebar").toggle();
				$("#map").toggle();
			}
		},

		switchTab:function(newTab) {
			$("#" + v.sidebar.activeTab).hide();
			$("#" + newTab).show();
			v.sidebar.activeTab = newTab;
		},

		toggleDbResults:function(){
			v.showMls = $("#adv_map_show_mls").is(":checked");
			v.showVerified = $("#adv_map_show_verified").is(":checked");

			v.m.reloadMap();
		}
	},

	bookmarks: {
		assignEvents:function(){
			$("#bookmarks_reload").on("click enter", v.bookmarks.getList);

		},

		add:function(){

		},

		remove:function(){

		},

		getList:function(){
			$.post("api/bookmark-hander", {action:'get'}).done(function(resp){
				console.log(resp);
			});
		}
	},

	mno_tiles: {
		opacity:0.5,

		tiles:{
			"O2-UK":{
				"CM-4G":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=0",
				"CM-L18":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=3",
				"CM-L21":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=1",
				"CM-L23":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=40",
				"CM-L08":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=20",
				"CM-L09":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=8",
				"3g2100-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_data/{z}/{x}/{y}.png",
				"3g2100":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_data/{z}/{x}/{y}.png",
				"3g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_datacombined/{z}/{x}/{y}.png",
				"4g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_lte/{z}/{x}/{y}.png",
				"LTE-M":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_ltem/{z}/{x}/{y}.png",
				"5g-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_5g/{z}/{x}/{y}.png",
				"5g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_5g/{z}/{x}/{y}.png",
				"VoLTE":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_volte/{z}/{x}/{y}.png"
			},
			"Three-UK":{
				"CM-4G":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=0",
				"CM-L18":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=3",
				"CM-L21":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=1",
				"CM-L14":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=32",
				"CM-L08":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=20",
				"3g":THREE_TMS_BASE + "Fast/{z}/{x}/{y}.png",
				"4g":THREE_TMS_BASE + "LTE/{z}/{x}/{y}.png",
				"4g800":THREE_TMS_BASE + "800/{z}/{x}/{y}.png",
				"5g":THREE_TMS_BASE + "FiveG/{z}/{x}/{y}.png",
			},
			"Vodafone-UK":{
				"CM-4G":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=0",
				"CM-L18":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=3",
				"CM-L21":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=1",
				"CM-L26":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=7",
				"CM-L08":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=20",
				"CM-L09":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=8",
				"CM-L26T":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=38",
			},
			"EE":{
				"CM-4G":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=0",
				"CM-L21":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=1",
				"CM-L18":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=3",
				"CM-L26":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=7",
				"CM-L08":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=20",
				"4g800":EE_TMS_BASE + "4g_800_ltea",
				"4g1800":EE_TMS_BASE + "4g_1800_ltea",
				"4g1800ds":EE_TMS_BASE + "4g_1800_ds_ltea",
				"4g2600":EE_TMS_BASE + "4g_2600_ltea",
				"2G-old":EE_TMS_BASE + "2g_ltea",
				"3G-old":EE_TMS_BASE + "3g_ltea",
				"4G-old":EE_TMS_BASE + "4g_ltea",
				"5G-old":EE_TMS_BASE + "5g_ltea",
				"2G":EE_TMS_BASE + "2g_ee",
				"3G":EE_TMS_BASE + "3g_ee",
				"4G":EE_TMS_BASE + "4g_ee",
				"5G":EE_TMS_BASE + "5g_ee"
			}
		},

		append_html:function(){
			for (let op in v.mno_tiles.tiles) {
				let el = $("<div/>");
				el.append($("<h4/>").text(op));

				for (let tile in v.mno_tiles.tiles[op]) {
					el.append(
						$("<button/>",{
							"class":"btn btn-dark btn-sm",
							"data-op":op,
							"data-tile":tile,
							"data-tileserver":v.mno_tiles.tiles[op][tile]
						}).text(tile).on("click enter", v.mno_tiles.add_server)
					);
				}

				$("#operator_maps").append(el);
			}

			$("#operator_tile_opacity").on("change", v.mno_tiles.update_opacity);
		},

		update_opacity:function(){
			v.mno_tiles.opacity = $(this).val() / 100;

			if (v.mno_tiles.tile_layer) {
				v.mno_tiles.tile_layer.setOpacity(v.mno_tiles.opacity);
			}
		},

		add_server:function(){
			let server = $(this).data("tileserver"),
				attr = $(this).data("op") + " " + $(this).data("tile");

			if (v.mno_tiles.tile_layer) v.m.map.removeLayer(v.mno_tiles.tile_layer);

			v.mno_tiles.tile_layer = new L.TileLayer(server, {attribution: attr, opacity: v.mno_tiles.opacity});
			v.m.map.addLayer(v.mno_tiles.tile_layer);
		}
	},

	m: {
		zoom: 10,
		defaultCoords:[52.5201508, -1.5807446],

		isNodeLoadingPaused:false,
		isNodePolygonPaused:false,

		map: null,
		map_id: "rdi",
		moveTimer:null,
		moveTimerDuration:1000,
		ico: {
			main: null,
			located: null,
			csv:null
		},

		init: function () {
			v.m.map = L.map('map', {
				preferCanvas:true
			}).setView(v.m.defaultCoords, v.m.zoom);

			if (!v.loadedFromParams) {
				v.m.moveToCurrentLocation();
			}
			v.m.map.addEventListener('contextmenu', v.m.mapMove);

			v.m.map.addEventListener('movestart', v.m.clearMoveTimer);
			v.m.map.addEventListener('move', v.m.clearMoveTimer);
			v.m.map.addEventListener('moveend', v.m.startMoveTimer);

			v.m.changeMap(v.m.map_id);
			v.m.initIcons();
		},

		toggleNodeLoading:function(){
			v.m.isNodeLoadingPaused = !v.m.isNodeLoadingPaused;
			$("#node_loading_pause").text(v.m.isNodeLoadingPaused ? "Unpause Node Loading" : "Pause Node Loading");

			v.u.updateUrl();
		},

		togglePolygonPause:function(){
			v.m.isNodePolygonPaused = !v.m.isNodePolygonPaused;
			$("#node_polygons_pause").text(v.m.isNodePolygonPaused ? "Enable Node Polygons" : "Disable Node Polygons");
			v.m.removeMapPolygons();
			//v.u.updateUrl();
		},

		clearMoveTimer:function(){
			if (v.m.moveTimer) clearTimeout(v.m.moveTimer);
			if (v.current_request) {
				v.current_request.abort();
				v.ui.popToastMessage('Node loading has been paused due to map move', true);
			}
		},

		startMoveTimer:function(){
			v.m.moveTimer = setTimeout(v.m.mapMove, v.m.moveTimerDuration);
		},

		moveToCurrentLocation: function() {
			v.getLocation(function (lat, lon) {
				v.m.map.setView([lat, lon], 14);
			});
		},

		initIcons: function () {
			let techIcon = L.Icon.extend({
				options: {
					iconSize: [25, 41],
					iconAnchor: [12.5, 41],
					popupAnchor: [0, -28]
				}
			});

			v.m.ico.main = new techIcon({iconUrl: 'static/img/marker-default.png'});
			v.m.ico.located = new techIcon({iconUrl: 'static/img/marker-located.png'});
			v.m.ico.csv = new techIcon({iconUrl: 'static/img/marker-csv.png'});
		},

		setMap: function(){
			v.m.changeMap($(this).val());
		},

		changeMap: function(map) {
			if (!map) map = "rdi";
			if (v.base) v.m.map.removeLayer(v.base);

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
			v.m.map_id = map;
			v.m.map.addLayer(v.base);

			v.u.updateUrl();
		},

		mapMove: function (evt) {
			v.u.updateUrl();
			v.m.reloadMap();
		},

		reloadMap: function() {
			if (v.m.isNodeLoadingPaused) {
				v.ui.popToastMessage("Node loading is currently paused.", true);
				return;
			}

			document.title = "Reloading Map...";
			v.ui.popToastMessage("Loading map data...", false);
			v.m.removeMapItems();
			v.loadData();
		},

		removeMapItems:function(){
			v.m.removeMapMarkers();
			v.m.removeMapPolygons();
		},

		removeMapMarkers: function() {
			for (let marker in v.markers) {
				v.m.map.removeLayer(v.markers[marker]);
			}

			v.markers = [];
		},

		removeMapPolygons: function(){
			for (let polygon in v.polygons) {
				v.m.map.removeLayer(v.polygons[polygon]);
			}

			v.polygons = [];
		}

	},

	csv: {

		conf:{
			header:true,
			skipEmptyLines:true,
			dynamicTyping: true,
			worker: false
		},

		markers:[],

		dataPoints:[],
		errors:[],
		files:[],

		init:function(){
			// Check for browser file support for this feature
			if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
				$("#files").empty().text('File API not supported');
				return;
			}

			// Add callback functions to config
			v.csv.conf['before'] = v.csv.parseBefore;
			v.csv.conf['step'] = v.csv.parseStep;
			v.csv.conf['complete'] = v.csv.parseComplete;

			// Assign event listener
			$("input[type=file]#csv_import").on("change", function(e) {
				v.csv.parseFile($(this).prop('files')[0]);
				return;
				let fileReader = new FileReader();

				fileReader.onload = function () {
					v.csv.parse(fileReader.result);
				};

				fileReader.readAsDataURL(
					$(this).prop('files')[0]
				);
			})
		},

		parseBefore: function(file, inputElem) {
			console.log(file);
			console.log(inputElem);
		},

		parseStep: function(row, parser) {
			let r = row.data;
			console.log(row.data);

			let point = {
				lat: r.lat || r.latitude || r.y || 0,
				lng: r.lng || r.lon || r.longitude || r.x || 0,
				text: ""
			};

			if (point.lat === 0 || isNaN(point.lat) || point.lng === 0 || isNaN(point.lng)) {
				v.csv.errors.push(
					row
				);
				return;
			}

			let m = new L.marker(
				[point.lat, point.lng],
				{
					draggable:false,
					autoPan:true,
					icon: v.m.ico.csv
				}
			);

			if (point.text !== "") {
				m.bindTooltip(point.text, {
					permanent: true,
					direction: 'bottom',
					className: 'marker_label'
				});
			}

			v.csv.dataPoints.push(m);
			v.m.map.addLayer(v.csv.dataPoints[v.csv.dataPoints.length-1]);
		},

		parseComplete: function(result, par) {
			console.log("done")
		},

		parseFile:function(f) {
			v.csv.files.push(
				Papa.parse(f, v.csv.conf)
			);
		},

		parse:function(text) {
			let raw = atob(text);
			v.csv.files.push(
				Papa.parse(raw, v.csv.conf)
			);
		}

	},

	u: {
		h:window.history,

		serialiseObject: function(obj){
			let str = "";
			for (let key in obj) {
				if (str != "") str += "&";

				str += key + "=" + encodeURIComponent(obj[key]);
			}

			return str;
		},

		deserialiseObject: function(str){
			let parts = str.split("&");

			let obj = {};
			for (let token in parts) {
				let kvpair = parts[token].split("=");
				obj[kvpair[0]] = decodeURIComponent(kvpair[1]);
			}

			return obj;
		},

		updateUrl:function() {
			let obj = window.location;
			let url = obj.origin + obj.pathname + "?";

			let loc = v.m.map.getCenter();
			let zoom = v.m.map.getZoom();
			let params = {
				"mcc": v.mcc,
				"mnc": v.mno,
				"paused": v.m.isNodeLoadingPaused ? 1 : 0,
				"map": v.m.map_id,
				"lat": loc.lat || -1.5,
				"lng": loc.lng || 52,
				"zoom": zoom || 13
			};

			let newUrl = url + v.u.serialiseObject(params);

			v.u.h.pushState(params, "Viewing " + params['mnc'], newUrl);
		},

		loadParams:function (cb) {
			let obj = v.u.deserialiseObject(window.location.search.substring(1));

			if (Object.keys(obj).length > 4) {
				v.loadedFromParams = true;

				if (obj.mnc) v.mno = parseInt(obj.mnc);
				if (obj.paused) v.m.isNodeLoadingPaused = parseInt(obj.paused) === 1;
				if (obj.lat && obj.lng) v.m.defaultCoords = [obj.lat, obj.lng];
				if (obj.zoom) v.m.zoom = parseInt(obj.zoom);
				if (obj.map) v.m.map_id = obj.map;
			}

			if (cb) cb();
		}
	},

	ui:{
		popToastMessage:function(txt, autohide){
			$("#toast_content_body").text(txt);
			$('#toast_content').attr('data-autohide', autohide).toast('show');
		},
		burnToastMessage:function(){
			$('#toast_content').attr('data-autohide', true).toast('hide');
		},

		popToastAction:function(txt, yesTxt, noTxt, successCallback){
			$("#toast_action_content").empty().append(
				txt,
				$("<br />"),
				$("<button/>",{"class":"btn btn-success"}).text(yesTxt).on("click enter", successCallback),
				" ",
				$("<button/>",{"class":"btn btn-danger"}).text(noTxt).on("click enter", v.ui.burnToastAction)
			);

			$("#toast_action_required").attr('data-autohide', false).toast('show');
		},
		burnToastAction:function(){
			$('#toast_action_required').attr('data-autohide', true).toast('hide');
		},
	},

	osm: {
		api_base:"https://nominatim.openstreetmap.org/",

		doLocationSearch:function(query) {
			$.ajax({
				url: v.osm.api_base + "search",
				data: "q=" + query + "&format=json&limit=1" + "&callback=?",
				type: "GET",
				timeout:15000,
				success: function(resp) {
					if (!resp[0]) {
						v.ui.popToastMessage("According to OSM, that isn't a valid location.", true);
						return;
					}

					v.ui.popToastMessage("You have been teleported!");
					v.m.map.setView([parseFloat(resp[0].lat), parseFloat(resp[0].lon)], 14);
				},
				error: function(e) {
					if (!navigator.onLine){
						v.ui.popToastMessage("You don't seem to be connected to the internet...", true);
					} else {
						v.ui.popToastMessage("Error searching for location.", true);
					}
				}
			});
		},

		getApproxLocation:function(lat, lng, cb) {
			$.ajax({
				url: v.osm.api_base + "reverse",
				data: "lat=" + lat + "&lon=" + lng + "&format=json&limit=1" + "&callback=?",
				type: "GET",
				timeout:15000,
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

	assignEvents: function() {
		$("#advanced_search").on("click enter", function () {
			$("#searchPopup").modal("hide");
			v.m.reloadMap();
		});
		$("#mobile_country_code").on("change", v.changeMno);
		$("#map_name").on("change", v.m.setMap);
		$("#enb_search_submit").on("click enter", v.doNodeSearch);
		$("#locate_user_manual").on("click enter", v.m.moveToCurrentLocation);

		$("#node_markers_clear").on("click enter", v.m.removeMapItems);
		$("#node_loading_pause").on("click enter", v.m.toggleNodeLoading);
		$("#node_polygons_pause").on("click enter", v.m.togglePolygonPause);

		v.sidebar.assignEvents();
		v.csv.init();
	},

	changeMno: function() {
		v.mno = parseInt($(this).val());
		v.updateMncOpts();
		v.u.updateUrl();
		v.m.reloadMap();
	},

	doNodeSearch: function() {
		if (v.mno === 0) {
			alert("Cannot search unless you select a mobile network.");
			return;
		}

		let enb = $("#enb_search").val();
		$.ajax({
			url: 'api/lookup-node/',
			type: 'GET',
			data: {
				"mnc":v.mno,
				"enb":enb
			},
			dataType: 'json',
			success: v.nodeSearchResults,
			error: function (e) {
				console.error(e);
			}
		});
	},

	nodeSearchResults: function(resp) {
		if (resp.response.length === 0) {
			alert("No eNodeB with this ID found");
			return;
		}

		let result = resp.response;

		v.m.map.setView([result.lat, result.lng], 15);
		v.m.reloadMap();
	},

	getMncData: function () {
		let reqData = {
			mcc: v.mcc
		};

		if ($("#adv_load_only_bounds_sector").is(":checked")) {
			let bounds = v.m.map.getBounds();
			reqData["nelat"] = round(bounds._northEast.lat, 9);
			reqData["nelng"] = round(bounds._northEast.lng, 9);
			reqData["swlat"] = round(bounds._southWest.lat, 9);
			reqData["swlng"] = round(bounds._southWest.lng, 9);
		}

		$.ajax({
			url: 'api/get-mccs',
			type: 'GET',
			data: reqData,
			dataType: 'json',
			success: v.updateMncData,
			error: function (e) {
				console.error(e);
			}
		});

		document.title = "Mappr [Alpha]";
	},

	updateMncData: function (data) {
		v.mncData = data;
		v.updateMncOpts();
	},

	updateMncOpts:function(){
		let $cont = $("#sector_list");
		$cont.empty();

		if (v.mno === 0){
			$cont.append(
				$("<h2/>").append("Select a specific operator to change sector IDs shown.")
			);
			return;
		}

		let keys = Object.keys(v.mncData);
		for (let i = 0, l = keys.length; i < l; i++) {
			let mncSectors = v.mncData[keys[i]];
			if (parseInt(keys[i]) !== v.mno) continue;

			$cont.append($("<strong/>").text(keys[i]));

			for (let j = 0, k = mncSectors.length; j < k; j++){
				if (j % 5 === 0) $cont.append($("<br />"));

				$cont.append(
					$("<label/>").text(mncSectors[j] + " "),
					$("<input/>",{
						"type":"checkbox",
						"name":"sectors[]",
						"value":mncSectors[j]
					})
				);
			}
		}
	},

	t:{
		getSiteAddr: function(el, lat, lng){
			let parent = el.parentElement;
			v.osm.getApproxLocation(lat, lng, function(data){
				parent.innerHTML = "<strong>Site Address:</strong><br/>" + data;
			});
		},

		getSiteHistory: function(el, mnc, enb){
			alert("Not yet " + mnc + " " + enb);
		}
	},

	sectorInfo: function (mno, enb, sectors) {
		let ret = "<strong>" + enb + "</strong>: ";
		switch (mno) {
			case 10:
				if (findItem(sectors, [115, 125, 135, 145, 155, 165])) ret += (enb >= 500000 ? "1 " : "40C1 ");
				if (findItem(sectors, [114, 124, 134, 144, 154, 164])) ret += (enb >= 500000 ? "3 " : "1 ");
				if (findItem(sectors, [110, 120, 130, 140, 150, 160])) ret += "20 ";
				if (findItem(sectors, [112, 122, 132])) ret += "8 ";
				if (findItem(sectors, [116, 126, 136, 146, 156, 166])) ret += (enb >= 500000 ? "40C1 " : "3 ");
				if (findItem(sectors, [117, 127, 137, 147, 157, 167])) ret += "40C2";
				break;
			case 15:
				if (findItem(sectors, [15, 25, 35, 45, 55, 65])) ret += (enb >= 500000 ? "1 " : "?");
				if (findItem(sectors, [14, 24, 34, 44, 54, 64])) ret += "1 ";
				if (findItem(sectors, [16, 26, 36, 46, 56, 66])) ret += "3 ";
				if (findItem(sectors, [18, 28, 38, 48, 58, 68])) ret += "7 ";
				if (findItem(sectors, [12, 22, 32])) ret += "8 ";
				if (findItem(sectors, [10, 20, 30, 40, 50, 60])) ret += "20 ";
				if (findItem(sectors, [19, 29, 39, 49, 59, 69])) ret += "38";
				break;
			case 20:
				if (findItem(sectors, [71, 72, 73, 74, 75, 76])) ret += "1 ";
				if (findItem(sectors, [0, 1, 2, 3, 4, 5])) ret += "3 ";
				if (findItem(sectors, [16])) ret += "3SC ";
				if (findItem(sectors, [6, 7, 8])) ret += "20";
				break;
			case 30:
				if (findItem(sectors, [18, 19, 20])) ret += "1 ";
				if (findItem(sectors, [15, 16, 17])) ret += "7T ";
				if (findItem(sectors, [0, 1, 2])) ret += "3P ";
				if (findItem(sectors, [3, 4, 5])) ret += "3S ";
				if (findItem(sectors, [6, 7, 8])) ret += "7P ";
				if (findItem(sectors, [9, 10, 11])) ret += "7S ";
				if (findItem(sectors, [12, 13, 14])) ret += "20";
				break;
			default:
				break;
		}

		return ret;
	},

	getDataParameters: function () {
		let data = {
			//"limit_m": 1500,
			//"limit_s": 36
		};

		// Coordinate bounds
		let bounds = v.m.map.getBounds();
		if (true) {
			data["ne_lat"] = round(bounds._northEast.lat, 12);
			data["ne_lng"] = round(bounds._northEast.lng, 12);
		}
		if (true) {
			data["sw_lat"] = round(bounds._southWest.lat, 12);
			data["sw_lng"] = round(bounds._southWest.lng, 12);
		}

		// Limits
		/*if ($("#adv_max_num_enb").val()) data["limit_m"] = $("#adv_max_num_enb").val();
		if ($("#adv_max_num_sec").val()) data["limit_s"] = $("#adv_max_num_sec").val();

		// eNB range
		if ($("#adv_enb_lower_bound").val().length !== 0 && $("#adv_enb_upper_bound").val().length !== 0) {
			data["enb_range"] = [
				$("#adv_enb_lower_bound").val(),
				$("#adv_enb_upper_bound").val()
			];
		}

		// Specific eNB
		if ($("#adv_enb_specific").val().length !== 0) {
			data["enb"] = $("#adv_enb_specific").val();
		}

		// Specific sectors
		if ($("input[type='checkbox'][name='sectors[]']").serialize().length !== 0){
			let sectors = $("input[type='checkbox'][name='sectors[]']").serializeArray();
			data["sectors"] = sectors.map(function(x){
				return parseInt(x.value);
			});
		}*/

		data["mnc"] = v.mno;
		data["mcc"] = 234;

		//if (v.showMls) data["estimate"] = 1;
		//if (v.showVerified) data["verified"] = 1;

		return data;
	},

	loadData: function () {
		v.current_request = $.ajax({
			url: 'api/map',
			type: 'GET',
			data: v.getDataParameters(),
			dataType: 'json',
			success: v.viewData,
			error: function (e) {
				console.error(e);
			}
		});
	},

	getPopupText: function (enb, mnc, lat, lng) {
		let t = '\
		<span class="site_popup_title">'+enb+'</span>\
		<strong>Lat / Lng Coords:</strong><br/>\
		<input class="form-control form-control-sm" type="text" readonly value="' + lat + ', ' + lng + '" />\
		<span class="site_popup_links">View on:<br/>\
			<a href="https://www.google.co.uk/maps/search/' + lat + ',' + lng + '/" target="_blank">Google Maps</a> | \
			<a href="https://www.openstreetmap.org/#map=15/' + lat + '/' + lng + '/" target="_blank">OSM</a> | \
			<a href="https://www.cellmapper.net/map?MCC=234&MNC=' + mnc + '&type=LTE&latitude=' + lat + '&longitude=' + lng + '&zoom=15&clusterEnabled=false" target="_blank">Cell Mapper</a>\
		</span>\
		<div class="site_approx_addr btn-group btn-group-sm" role="group" aria-label="Basic example">\
			<button type="button" class="btn btn-secondary" onclick="v.t.getSiteAddr(this,' + lat + ',' + lng + ')">Address</button>\
			<button type="button" class="btn btn-primary btn-sm" onclick="v.t.getSiteHistory(this,' + mnc + ',' + enb + ')">Location History</button>\
		</div>';

		return t;
	},

	getSectorText: function () {

	},

	getSectorColor: function (mnc, sector) {
		let sectorName = v.sData[mnc][sector];
		let sectorId = mnc.toString() + sectorName;
		let sectorMD5 = MD5(sectorId);

		return '#' + sectorMD5.substring(0, 6);
	},

	viewData: function (data){
		$("#results_tbl").empty();

		v.ui.popToastMessage('Parsing data from server...', false);

		for (let i = 0; i < data.response.length; i++) {
			v.addPointToMap(data.response[i]);
			v.addPointToTable(data.response[i]);
		}

		// Display items on map
		v.markers.forEach(function (marker) {
			v.m.map.addLayer(marker);
		});
		v.polygons.forEach(function (polygon) {
			v.m.map.addLayer(polygon);
		});

		v.ui.burnToastMessage();
		document.title = "Mappr";
	},

	p: {
		move_attempt:{},

		attemptMove:function(evt){
			if (!evt) return;

			v.p.move_attempt = {
				mcc:v.mcc,
				mnc:evt.target.options.mnc,
				enb:evt.target.options.enb,
				lat:evt.target._latlng.lat,
				lng:evt.target._latlng.lng
			};

			v.ui.popToastAction("Are you sure you wish to move this node?", "Yes", "No", function(){
				v.ui.burnToastAction();
				v.p.sendMove();
			});
		},

		sendMove:function(){
			v.ui.popToastMessage("Updating Node....", false);

			$.ajax({
				url: 'api/update-node/',
				type: 'POST',
				data: v.p.move_attempt,
				dataType: 'json',
				success: function (resp) {
					console.log(resp);
					v.ui.popToastMessage("Update Success", true);
					v.m.reloadMap();
				},
				error: function (e) {
					v.ui.popToastMessage("Failed to update node!", true);
					console.error(e);
				}
			});
		}
	},

	addPointToMap: function (point) {
		let tLat = round(point.lat, 7);
		let tLng = round(point.lng, 7);
		let tEnb = point.node_id;

		let markerPopOpts = {
			maxWidth: (screen.availWidth >= 600 ? 600 : screen.availWidth),
			className: 'site_popup'
		};

		let markerToolOpts = {
			permanent: true,
			direction: 'bottom',
			className: 'marker_label'
		};

		function pushPolygon(siteloc, sectorloc, color) {
			v.polygons.push(
				L.polygon(
					[siteloc, sectorloc],
					{color: color}
				)
			);
		}

		function pushMarker(siteloc, poptext, tooltext, point) {
			v.markers.push(
				new L.marker(
					siteloc,
					{
						mnc:point.mnc,
						enb:point.id,
						draggable:true,
						autoPan:true,
						icon: (point.verified ? v.m.ico.located : v.m.ico.main)
					}
				).bindPopup(
					poptext, markerPopOpts
				).bindTooltip(
					tooltext, markerToolOpts
				).on('moveend', v.p.attemptMove)
			);
		}

		let txt = v.getPopupText(tEnb, point.mnc, tLat, tLng);

		//sectCoords = [];
		txt += "<div class='sect_block'>";
		for (let s in point.sectors) {
			let color = v.getSectorColor(point.mnc, s);

			let dateObj = new Date();
			let dates = "";
			dateObj.setTime(parseInt(point.sectors[s][2]) * 1000);
			dates += "First Seen: " + dateObj.toUTCString() + "\n";
			dateObj.setTime(parseInt(point.sectors[s][3]) * 1000);
			dates += "Last Seen: " + dateObj.toUTCString() + "\n";

			txt += "<span class='sect' style='background-color:" + color + "' title='" + dates + "'>" + s + "</span>";

			//sectCoords.push([point.sectors[s][0], point.sectors[s][1]]);
			if (!v.m.isNodePolygonPaused) pushPolygon([tLat, tLng], [parseFloat(point.sectors[s][0]), parseFloat(point.sectors[s][1])], color);
		}
		txt += "</div>";

		//if (v.user.list[point.verified]){
		//	txt += '<br />Located by: ' + v.user.list[point.verified];
		//}

		pushMarker([tLat, tLng], txt, v.sectorInfo(parseInt(point.mnc), tEnb, Object.keys(point.sectors)), point);
	},

	addPointToTable: function (point) {
		let $r = $("#results_tbl");

		function getSectors(){
			return Object.keys(point.sectors).join(", ");
		}

		$r.append(
			$("<tr/>",{
				"data-lat":point.lat,
				"data-lng":point.lng
			}).on("click enter",v.goToHereData).append(
				$("<td/>").text(point.mnc),
				$("<td/>").text(point.id),
				$("<td/>").text(getSectors())
			)
		);
	},

	goToHereData:function(){
		v.m.map.setView([$(this).data("lat"), $(this).data("lng")], 16);
	}
};

v.u.loadParams(v.init);
