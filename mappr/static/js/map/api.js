/*
	Handles contacting the API
*/

let _api = {

	currentRequest: null,

	getMapBounds: function () {
		let apiBounds = {};

		// Coordinate area to load
		let bounds = v.m.map.getBounds();
		apiBounds["ne_lat"] = round(bounds._northEast.lat, 12);
		apiBounds["ne_lng"] = round(bounds._northEast.lng, 12);
		apiBounds["sw_lat"] = round(bounds._southWest.lat, 12);
		apiBounds["sw_lng"] = round(bounds._southWest.lng, 12);

		return apiBounds;
	},

	map: {
		getParams: function (){
			let data = {};

			// Get selected MCC / MNC
			data['mcc'] = _app.mcc;
			data['mnc'] = _app.mnc;

			// Get any node_id constraints


			// Get any sector_id constraints


			// Get any pci constraints


			// Get any time constraints



			return Object.assign(
				data,
				_api.getMapBounds()
			);
		},

		loadArea: function() {
			document.title = 'Updating Map...';

			_api.currentRequest = $.ajax({
				url: 'api/map',
				type: 'GET',
				data: _api.map.getParams(),
				dataType: 'json',
				success: _api.map.success,
				error: function (e) {
					document.title = 'API Error!';
					console.error(e);
				}
			});
		},

		success:function(resp) {
			_ui.popToastMessage('Parsing data from server...', false);

			if (!resp || resp.error) {
				_ui.popToastMessage(resp.msg || 'Unknown API error', false);
				return;
			}

			_table.addData(resp.response);
			_map.addData(resp.response);

			document.title = 'Mappr2 | Map';
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
