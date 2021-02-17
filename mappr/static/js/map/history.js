/*
	Handles history API
*/

let _history = {
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
};
