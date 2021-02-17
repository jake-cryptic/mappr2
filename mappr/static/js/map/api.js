/*
	Handles contacting the API
*/

let _api = {

	currentRequest: null,

	getMapAreaParameters: function () {
		let data = {};

		// Coordinate area to load
		let bounds = v.m.map.getBounds();
		data["ne_lat"] = round(bounds._northEast.lat, 12);
		data["ne_lng"] = round(bounds._northEast.lng, 12);
		data["sw_lat"] = round(bounds._southWest.lat, 12);
		data["sw_lng"] = round(bounds._southWest.lng, 12);

		return data;
	},

	map: {
		loadArea: function() {
			_api.currentRequest = $.ajax({
				url: 'api/map',
				type: 'GET',
				data: v.getDataParameters(),
				dataType: 'json',
				success: v.viewData,
				error: function (e) {
					console.error(e);
				}
			});
		}
	},

	nodeSearch: {
		doNodeSearch: function() {
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
	}

};
