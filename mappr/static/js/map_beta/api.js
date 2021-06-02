/*
	Handles contacting the API
*/

let _api = {

	currentRequest: null,
	timeout: 30000,
	total_analytics: 0,
	apiCompat: 2,
	csrf:'',
	base:'/api/',

	init: function () {
		_api.prepareAjax();
		_worker.init();
		_api.data.getMccSectors();
		_api.users.getUsers();

		console.log('[API]-> Initialised');
	},

	checkApiCompat: function (resp) {
		if (!resp || !resp.version) {
			console.error('Could not detect API version in response');
			return false;
		}

		if (_api.apiCompat !== resp.version) {
			_ui.popToastMessage('Your browser\'s copy of Mappr is out of date! You may encounter errors.', 3000, true, 'warning');
			return false;
		}

		return true;
	},

	track: function (params) {
		if (typeof (_paq) === "undefined") return;
		_paq.push(params);
		_api.total_analytics += 1;
	},

	prepareAjax: function () {
		_api.csrf = $('#csrf_token').data('value');

		$.ajaxSetup({
			cache: false,
			timeout: _api.timeout,
			beforeSend: function (xhr, settings) {
				if (!this.crossDomain) {
					if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type)) {
						xhr.setRequestHeader("X-CSRFToken", _api.csrf);
					}
					xhr.setRequestHeader("X-MAPPR-API-VERSION", _api.apiCompat);
				}
			}
		});
	},

	error: function (e, msg) {
		console.error(e);
		if (e.status === 429) {
			_ui.popToastMessage('You are performing actions too quickly!', 10000, true, 'danger');
			return;
		}
		if (e.statusText === 'abort') {
			_ui.popToastMessage('Request cancelled by user action.', 1000, true, 'danger');
			return;
		}
		if (!navigator.onLine) {
			_ui.popToastMessage('You are not online!', 5000);
		}
		_ui.popToastMessage(msg + ' ' + (e.statusText || 'Unknown API error'), 5000);
	},

	users: {
		cache: {},

		getUserFromId: function (id) {
			if (_api.users.cache[id] === undefined) {
				return 'Unknown user';
			}

			return _api.users.cache[id]['name'];
		},

		addUsers: function (resp) {
			for (let user in resp) {
				_api.users.cache[user] = {
					'name': resp[user]
				};
			}
		},

		getUsers: function (users = []) {
			let queryList = {
				'users': users
			};

			$.ajax({
				url: _api.base + 'users/get',
				type: 'POST',
				data: queryList,
				dataType: 'json',
				success: function (resp) {
					if (!resp || resp.error === true) {
						console.error(resp);
						return;
					}

					_api.checkApiCompat(resp);

					let keys = Object.keys(resp.response);
					if (keys.length === 0) {
						console.error('No Users');
						return;
					}

					_api.users.addUsers(resp.response);
				},
				error: function (e) {
					_api.error(e, 'Failed to load user information!');
				}
			});
		}
	},

	data: {
		current_mcc: {},

		getMccSectors: function () {
			$.ajax({
				url: _api.base + 'get-sectors',
				type: 'GET',
				data: {
					'mcc': _app.mcc
				},
				dataType: 'json',
				success: _api.data.setMccSectors,
				error: function (e) {
					_api.error(e, 'Failed to load data for mcc!');
				}
			});
		},

		setMccSectors: function (resp) {
			if (!resp || resp.error === true) {
				alert('Fatal Error');
				console.error(resp);
				return;
			}

			_api.checkApiCompat(resp);

			_api.data.current_mcc = resp.response;
			_ui.controls.updateSectorList();
		}
	},

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
		getParams: function () {
			let data = {};

			data['time'] = new Date().getTime();

			// Get selected RAT / MCC / MNC
			data['rat'] = _app.rat;
			data['mcc'] = _app.mcc;
			data['mnc'] = _app.mnc;

			// Get any node_id constraints
			if ($("#node_filter_range_lower").val().length !== 0 && $("#node_filter_range_upper").val().length !== 0) {
				data["enb_range"] = {
					'lower': $("#node_filter_range_lower").val() || 0,
					'upper': $("#node_filter_range_upper").val() || 9999999
				};
			}

			// Specific node_id
			// TODO: Implement list of node_ids split by space or comma
			if ($("#node_filter_list").val().length !== 0) {
				data["enb"] = $("#node_filter_list").val();
			}


			// Get any sector_id constraints
			let sectors = $("input[type='checkbox'][name='sectors[]']").serializeArray();
			data["sectors"] = sectors.map(function (x) {
				return parseInt(x.value);
			});

			// Get any pci constraints
			// TODO: Split PCI list at comma or space
			if ($("#pci_filter_list").val().length !== 0) {
				data['pci'] = $('#pci_filter_list').val();
			}

			// Get any time constraints
			data['date'] = {
				'filter': $('#node_date_filter').val(),
				'lower': Math.floor(getUnixTimeFromDate($('#node_first_seen').val()) / 1000),
				'upper': Math.floor(getUnixTimeFromDate($('#node_last_updated').val()) / 1000)
			};

			// What nodes does the user want to see?
			data['show_mls'] = $('#node_toggle_mls').is(':checked');
			data['show_mappr'] = $('#node_toggle_mappr').is(':checked');
			data['show_low_accuracy'] = $('#node_toggle_low_accuracy').is(':checked');

			// Add map bounds and send request
			return Object.assign(
				data,
				_api.getMapBounds()
			);
		},

		loadArea: function () {
			document.title = 'Updating Map...';

			_api.currentRequest = $.ajax({
				url: _api.base + 'map',
				type: 'GET',
				data: _api.map.getParams(),
				dataType: 'json',
				success: _api.map.success,
				error: function (e) {
					document.title = 'API Error!';
					_api.error(e, 'Failed to load map area!');
				}
			});
		},

		success: function (resp) {
			if (!resp || resp.error) {
				_ui.popToastMessage(resp.message || 'Unknown API error', 10000, true, 'danger');
				return;
			}

			_api.checkApiCompat(resp);

			document.title = _ui.current_title;

			let len = resp.response.length || 0;
			if (len === 0) {
				_ui.popToastMessage('Map area loaded. No nodes found.', 2000, true, 'danger');
				return;
			}

			_ui.popToastMessage('Map area loaded: Showing ' + len + ' nodes', 1500, true, 'success');

			_table.addData(resp.response);
			_map.addData(resp.response);
		}
	},

	nodeSearch: {

		last_node_id: '',

		doNodeSearch: function () {
			$('#enb_search_submit').prop('disabled', true);
			_api.nodeSearch.last_node_id = $("#enb_search_input").val();
			let request_data = {
				'node_id': _api.nodeSearch.last_node_id,
				'mcc': _app.mcc
			};

			if (_app.mnc !== 0) {
				request_data['mnc'] = _app.mnc;
			}

			$.ajax({
				url: _api.base + 'lookup-node',
				type: 'GET',
				data: request_data,
				dataType: 'json',
				success: _api.nodeSearch.success,
				error: function (e) {
					$('#enb_search_submit').prop('disabled', false);
					_api.track(['trackSiteSearch', _api.nodeSearch.last_node_id, _app.mcc + '-' + _app.mnc, -1]);
					_api.error(e, 'Failed to lookup node!');
				}
			});
		},

		success: function (resp) {
			if (!resp || resp.error === true) {
				_api.track(['trackSiteSearch', _api.nodeSearch.last_node_id, _app.mcc + '-' + _app.mnc, -1]);
				alert(resp.error === true ? resp.message : 'An error occurred');
				return;
			}

			let result = resp.response;

			_api.track(['trackSiteSearch', _api.nodeSearch.last_node_id, _app.mcc + '-' + _app.mnc, result.length]);

			if (result.length === 0) {
				alert("No eNodeB with this ID found");
			} else if (result.length === 1) {
				// _app.mnc = result[0].mnc; To change, or not to change?
				_map.setLocation(result[0].lat, result[0].lng, 15);
				_map.reloadMap();
			} else {
				_ui.displayMultipleNodeResults(result);
			}

			$('#enb_search_submit').prop('disabled', false);
		}
	},

	nodeUpdate: {
		move_attempt: {},

		sendMove: function () {
			_ui.popToastMessage("Updating Node....", false, true, 'warning');

			$.ajax({
				url: _api.base + 'update-node',
				type: 'POST',
				data: _api.nodeUpdate.move_attempt,
				dataType: 'json',
				success: function (resp) {
					_api.checkApiCompat(resp);
					_ui.popToastMessage("Update Success", 5000, true, 'success');
					_map.reloadMap();
				},
				error: function (e) {
					_api.error(e, 'Failed to update node!');
				}
			});
		}
	},

	history: {
		doLookupNode: function (mcc, mnc, node_id, cb) {
			let request_data = {
				'node_id': node_id,
				'mcc': mcc,
				'mnc': mnc
			};

			_ui.popToastMessage('Loading location history..', 250, true, 'warning');

			$.ajax({
				url: _api.base + 'lookup-history',
				type: 'GET',
				data: request_data,
				dataType: 'json',
				success: function (resp) {
					if (!resp || resp.error === true) {
						alert(resp.error === true ? resp.message : 'An error occurred');
						return;
					}

					_api.checkApiCompat(resp);

					cb(resp.response, mcc, mnc, node_id);
				},
				error: function (e) {
					_api.error(e, 'Failed to load location history!');
				}
			});
		}
	}

};
