/*
	Handles history API
*/

let _history = {

	loadedFromParams:false,

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

		let loc = _map.state.map.getCenter();
		let zoom = _map.state.map.getZoom();
		let params = {
			"mcc": _app.mcc,
			"mnc": _app.mnc,
			"paused": _map.state.isNodeLoadingPaused ? 1 : 0,
			"map": _map.state.map_id,
			"lat": loc.lat || -1.5,
			"lng": loc.lng || 52,
			"zoom": zoom || 13
		};

		let newUrl = url + _history.serialiseObject(params);

		window.history.pushState(params, "Viewing " + params['mnc'], newUrl);
	},

	loadParams:function (cb) {
		let obj = _history.deserialiseObject(window.location.search.substring(1));

		if (Object.keys(obj).length > 4) {
			_history.loadedFromParams = true;

			if (obj.mcc) _app.mcc = parseInt(obj.mcc);
			if (obj.mnc) _app.mnc = parseInt(obj.mnc);
			if (obj.paused) _map.state.isNodeLoadingPaused = parseInt(obj.paused) === 1;
			if (obj.lat && obj.lng) _map.state.defaultCoords = [obj.lat, obj.lng];
			if (obj.zoom) _map.state.zoom = parseInt(obj.zoom);
			if (obj.map) _map.state.map_id = obj.map;
		}

		if (cb) cb();
	},

	urlChange:function(){
		// TODO: Change map when forward / back buttons are pressed
		// TODO: Add UI controls to enable / disable this behaviour
	}

};
