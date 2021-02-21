/*
	Handles contacting the API
*/

let _api = {

	currentRequest: null,

	getMapBounds: function () {
		let apiBounds = {};

		// Coordinate area to load
		let bounds = _map.state.map.getBounds();
		apiBounds["ne_lat"] = round(bounds._northEast.lat, 12);
		apiBounds["ne_lng"] = round(bounds._northEast.lng, 12);
		apiBounds["sw_lat"] = round(bounds._southWest.lat, 12);
		apiBounds["sw_lng"] = round(bounds._southWest.lng, 12);

		return apiBounds;
	},

	map: {
		getParams: function (){
			let data = {};

			// Get selected RAT / MCC / MNC
			data['rat'] = _app.rat;
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
			_ui.popToastMessage('Parsing data from server...', false, true);

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
			let request_data = {
				'enb': enb,
				'mcc': _app.mcc
			};

			if (_app.mnc !== 0){
				request_data['mnc'] = _app.mnc;
			}

			$.ajax({
				url: 'api/lookup-node/',
				type: 'GET',
				data: request_data,
				dataType: 'json',
				success: _api.nodeSearch.success,
				error: function (e) {
					console.error(e);
				}
			});
		},

		success: function(resp) {
			if (resp.response.length === 0) {
				alert("No eNodeB with this ID found");
				return;
			}

			let result = resp.response;

			_map.state.map.setView([result.lat, result.lng], 15);
			_map.reloadMap();
		},
	},

	nodeUpdate: {
		move_attempt:{},

		sendMove:function(){
			_ui.popToastMessage("Updating Node....", false, true, 'warning');

			$.ajax({
				url: 'api/update-node/',
				type: 'POST',
				data: _api.move_attempt,
				dataType: 'json',
				success: function (resp) {
					console.log(resp);
					_ui.popToastMessage("Update Success", true, true, 'success');
					_map.reloadMap();
				},
				error: function (e) {
					_ui.popToastMessage("Failed to update node!", true, true, 'danger');
					console.error(e);
				}
			});
		}
	}

};
