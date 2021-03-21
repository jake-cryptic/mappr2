/*
	Handles updating the UI
*/

let _ui = {

	current_modal: null,
	current_title: 'Mappr2 | Map',

	init:function() {
		_ui.populateSelectors();
		_ui.populateMncSelector(_app.mcc);
		if (_history.loadedFromParams === true) {
			_ui.updateUiOnLoad();
		}

		_ui.updateTitle();
		_ui.updateLinks();

		_ui.controls.init();

		console.log('[UI]-> Initialised');
	},

	populateSelectors: function (){
		let mccs = Object.keys(_data);
		$d = $('#select_mcc');
		$d.empty();

		for (let i = 0; i < mccs.length; i++) {
			let country = _data[mccs[i]];
			let data = {
				'value':mccs[i]
			};
			if (parseInt(mccs[i]) === _app.mcc) data['selected'] = true;

			$d.append(
				$('<option/>', data).text('[' + mccs[i] + '] ' + country['country_name'])
			);
		}
	},

	populateMncSelector: function (mcc){
		let thisMcc = _data[mcc]['providers'];
		let mncs = Object.keys(thisMcc);
		$d = $('#select_mnc');
		$d.empty().append(
			$('<option/>',{'value':0, 'selected':true}).text('All Providers')
		);

		for (let i = 0; i < mncs.length; i++) {
			let provider = thisMcc[mncs[i]];
			let data = {
				'value':mncs[i]
			};

			$d.append(
				$('<option/>', data).text('[' + mncs[i] + '] ' + provider['short'])
			);
		}
	},

	updateLinks: function () {
		let thisMcc = _data[_app.mcc];

		if (thisMcc['mobile_spectrum_url'] === null) {
			$('#open_mobile_spectrum').attr('href', 'https://mobilespectrum.org/').text('Visit Mobile Spectrum');
		} else {
			$('#open_mobile_spectrum').attr('href', thisMcc.mobile_spectrum_url).text('View ' + thisMcc['country_short'] + ' Spectrum Allocations');
		}
	},

	controls: {
		init:function() {
			// Button press events
			$('#sidebar_toggle').on('click enter', _ui.sidebar.toggleView);
			$('#locate_user_manual').on('click enter', _ui.controls.moveMapToUser);
			$('#toggle_geo_watch').on('click enter', _ui.controls.watchGeoUser);
			$('#node_markers_clear').on('click enter', _map.items.removeMapItems);
			$('#node_loading_pause').on('click enter', _map.items.toggleNodeLoading);
			$('#node_polygons_pause').on('click enter', _map.items.togglePolygonPause);
			$('#map_clustering_toggle').on('click enter', _map.items.toggleMarkerCluster);
			$('#ui_show_toasts').on('click enter', _ui.toasts.toggle);
			$('.reload-on-change').on('change', _ui.controls.filterReload);
			$('#filter_force_reload').on('click enter', _ui.controls.reloadMap);


			// Select box change events
			$("#select_rat").on("change", _app.changeRat);
			$("#select_mcc").on("change", _app.changeMcc);
			$("#select_mnc").on("change", _app.changeMnc);
			$("#map_name").on("change", _map.setMap);

			// API query events
			$('#enb_search_submit').on('click enter', _api.nodeSearch.doNodeSearch);
			// $('#pci_search_submit').on('click enter', _api.nodeSearch.doNodeSearch);

			// OSM location search
			$("#do_world_location_search").on("click enter", function(){
				_ui.controls.osmQuery();
			});
			$("#world_location_search").on("keypress", function(evt){
				if (evt.keyCode === 13) {
					_ui.controls.osmQuery();
				}
			});
		},

		filterReload: function(){
			$('#filter_force_reload').prop('disabled', false);
		},

		reloadMap: function(){
			$('#filter_force_reload').prop('disabled', true);
			_ui.popToastMessage('Reloading map with filters applied', 500, true, 'info');
			_map.reloadMap();
		},

		setNodeLoadingState:function (){
			$("#node_loading_pause").html(
				_map.state.isNodeLoadingPaused ?
					"<i class='fas fa-play'></i> Unpause Node Loading" :
					"<i class='fas fa-pause'></i> Pause Node Loading"
			);
			_api.track(['trackEvent', 'UISetting', 'nodeLoadingPaused ' + _map.state.isNodePolygonPaused]);
		},

		setPolygonPauseState:function (){
			$("#node_polygons_pause").html(
				_map.state.isNodePolygonPaused ?
					"<i class='fas fa-shapes'></i> Enable Polygons" :
					"<i class='fas fa-shapes'></i> Disable Polygons"
			);
			_api.track(['trackEvent', 'UISetting', 'nodePolygonPaused ' + _map.state.isNodePolygonPaused]);
		},

		setMarkerClusterState:function (){
			$("#map_clustering_toggle").html(
				_map.settings.markerCluster ?
					"<i class='fas fa-circle'></i> Disable Clustering" :
					"<i class='fas fa-circle'></i> Enable Clustering"
			);
			_api.track(['trackEvent', 'UISetting', 'markerClusterEnabled ' + _map.settings.markerCluster]);
		},

		setToastPauseState:function (){
			$("#ui_show_toasts").html(
				_ui.toasts.toasts_allowed ?
					"<i class='fas fa-bread-slice'></i> Disable Toast Alerts" :
					"<i class='fas fa-bread-slice'></i> Enable Toast Alerts"
			);
			_api.track(['trackEvent', 'UISetting', 'toastAlertsDisabled ' + _ui.toasts.toasts_allowed]);
		},

		setMapSelector: function() {
			$('#map_name').val(_map.state.map_id);
		},

		setRatSelector: function() {
			$('#select_rat').val(_app.rat);
		},

		setMccSelector: function() {
			$('#select_mcc').val(_app.mcc);
		},

		setMncSelector: function() {
			$('#select_mnc').val(_app.mnc);
		},

		moveMapToUser:function(){
			_ui.popToastMessage('Attempting to move to your location...', true);
			_map.moveToCurrentLocation();
		},

		watchGeoUser:function(){
			if (_map.watch.id === null) {
				_map.watch.init();
				$('#toggle_geo_watch').text('Stop Watching');
			} else {
				_map.watch.stop();
				$('#toggle_geo_watch').text('Watch Geolocation');
			}
		},

		osmQuery: function() {
			let locationSearch = $("#world_location_search").val();
			_map.osm.doLocationSearch(locationSearch);
			_api.track(['trackEvent', 'MapControl', 'osm_query ' + locationSearch]);
		},

		updateSectorList: function(){
			let $list = $("#sector_list");
			let thisMcc = _data[_app.mcc]['providers'];
			$list.empty();

			let mncs = Object.keys(_api.data.current_mcc);
			for (let i = 0, l = mncs.length; i < l; i++) {
				if (Object.keys(thisMcc).indexOf(mncs[i]) === -1) {
					continue;
				}

				let mncSectors = _api.data.current_mcc[mncs[i]];

				// If an mnc is selected, don't show other mnc sectors
				if (_app.mnc !== 0) {
					if (parseInt(mncs[i]) !== _app.mnc) continue;
				}

				$mnc = $('<div/>', {
					'id':'sectors_list_mnc' + mncs[i]
				});

				if (mncSectors.length > 50) {
					$mnc.append('too many sectors to display here.');
				} else {
					for (let j = 0, k = mncSectors.length; j < k; j++) {
						if (j !== 0 && j % 5 === 0) $mnc.append($("<br />"));

						$mnc.append(
							$("<label/>", {
								'for':'sectors_select_mnc' + mncs[i] + 'sid' + mncSectors[j]
							}).text(mncSectors[j]),
							$("<input/>",{
								"type":"checkbox",
								"id":'sectors_select_mnc' + mncs[i] + 'sid' + mncSectors[j],
								"class":"form-check-input m-1",
								"name":"sectors[]",
								"aria-label":'Sector ' + mncSectors[j],
								"value":mncSectors[j]
							})
						);
					}
				}

				$list.append(
					$("<h4/>",{
						'class':'h5'
					}).text('Sector IDs for: ' + thisMcc[mncs[i]]['short']),
					$mnc,
					$("<hr/>")
				);
			}
		}
	},

	sidebar: {
		toggleView:function() {
			if (window.innerWidth > 768) {
				if ($("#sidebar").is(":visible")) {
					$("#sidebar").hide();
					$("#map").css("width", "100%");
				} else {
					$("#sidebar").show();
					$("#map").css("width", "80%");
				}
			} else {
				if ($("#sidebar").is(":visible")) {
					$("#sidebar").fadeOut(500);
				} else {
					$('#sidebar').css({
						'position':'absolute',
						'z-index':1001,
						'background-color':'rgba(255,255,255,0.95)',
						'height':'auto'
					}).fadeIn(500);
				}

				// $("#map").toggle();
				// $("#sidebar").toggle();
			}
		}
	},

	updateTitle: function() {
		let mccData = _data[_app.mcc];
		let mncName = 'All Providers';
		if (_app.mnc !== 0) {
			mncName = mccData['providers'][_app.mnc]['short'];
		}
		_ui.current_title = 'Mappr2 | (' + mccData['country_short'] + ') ' + mncName;

		document.title = _ui.current_title;
	},

	updateUiOnLoad: function() {
		_ui.controls.setNodeLoadingState();
		_ui.controls.setPolygonPauseState();

		_ui.controls.setMapSelector();
		_ui.controls.setRatSelector();
		_ui.controls.setMccSelector();
		_ui.controls.setMncSelector();
	},

	displayMultipleNodeResults: function(results) {
		$html = $('<tbody/>');

		results.forEach(function(r){
			$html.append(
				$('<tr/>',{
					'class':'cursor-pointer',
					'data-lat':r.lat,
					'data-lng':r.lng
				}).on('click enter', _map.goToHereData).append(
					$('<td/>').text(r.mnc),
					$('<td/>').text(r.node_id),
					$('<td/>').text(r.lat),
					$('<td/>').text(r.lng)
				)
			)
		});

		_ui.openModal(
			'eNb Search Results',
			$('<div/>').append(
				$('<h4/>',{
					'class':'h5'
				}).text('Click a result to go to it'),
				$('<table/>', {
					'class':'table table-striped'
				}).append(
					$('<thead/>').append(
						$('<tr/>').append(
							$('<th/>').text('MNC'),
							$('<th/>').text('eNB'),
							$('<th/>').text('Lat'),
							$('<th/>').text('Lng')
						)
					),
					$html
				)
			)
		);
	},

	getSiteAddr: function(el, lat, lng){
		el.innerText = 'Loading...';

		let parent = el.parentElement;
		_map.osm.getApproxLocation(lat, lng, function(data) {
			let $newContent = $('<p/>').append(
				$('<strong/>').text('Site address:'),
				$('<br/>'),
				data
			);
			parent.replaceWith($newContent[0]);
		});
	},

	getSiteHistory: function(el, mcc, mnc, enb) {
		el.innerText = 'Loading...';
		_api.track(['trackEvent', 'NodeLocation', 'getSiteHistory ' + mcc + '-' + mnc + '-' + enb]);
		_api.history.doLookupNode(mcc, mnc, enb, _ui.displaySiteHistory);
		setTimeout(function () {
			el.innerText = 'History';
		},500);
	},

	displaySiteHistory: function(results, mcc, mnc, enb) {
		$html = $('<tbody/>');

		if (!results || results.length === 0) {
			$html.append(
				$('<tr/>').append(
					$('<td/>', {'colspan':5}).text('This site has not been moved')
				)
			);
		} else {
			results.forEach(function(r){
				$html.append(
					$('<tr/>',{
						'class':'cursor-pointer',
						'data-lat':r.lat,
						'data-lng':r.lng,
						'data-zoom': 17
					}).on('click enter', _map.goToHereData).append(
						$('<td/>').text(r.time),
						$('<td/>').text(r.node_id),
						$('<td/>').text(_api.users.getUserFromId(r.user_id)),
						$('<td/>').text(r.lat),
						$('<td/>').text(r.lng)
					)
				)
			});
		}

		_ui.openModal(
			'Site History for: ' + mcc + '-' + mnc + ':' + enb,
			$('<div/>').append(
				$('<table/>', {
					'class':'table table-striped'
				}).append(
					$('<thead/>').append(
						$('<tr/>').append(
							$('<th/>').text('Time'),
							$('<th/>').text('eNB'),
							$('<th/>').text('User'),
							$('<th/>').text('Lat'),
							$('<th/>').text('Lng')
						)
					),
					$html
				)
			)
		);
	},

	openModal: function(title, $body) {
		$('#mappr_modal_title').text(title);
		$('#mappr_modal_body').empty().html($body);

		_ui.current_modal = new bootstrap.Modal(
			document.getElementById('mappr_modal'),
			{
				keyboard: true,
				focus: true
			}
		);

		_ui.current_modal.show();
	},

	toasts:{

		toasts_allowed: true,

		toggle:function(){
			_ui.toasts.toasts_allowed = !_ui.toasts.toasts_allowed;
			_ui.controls.setToastPauseState();
		}

	},

	freshToast: function($toastBody, autohide, type = ''){
		let toastOpts = {
			'class':'toast mx-5',
			'role':'alert',
			'aria-live':'polite',
			'aria-atomic':true
		};

		if (!!autohide) {
			toastOpts['data-autohide'] = !!autohide;
			toastOpts['data-delay'] = autohide;
		}

		return $("<div/>",toastOpts).append(
			$("<div/>",{
				'class':'toast-header'
			}).append(
				$("<strong/>", {
					'class':'me-auto text-primary'
				}).text('Message'),
				$('<small/>',{
					'class':'text-muted'
				}),
				$('<button/>',{
					'type':'button',
					'class':'btn-close',
					'data-bs-dismiss':'toast',
					'aria-label':'close'
				})
			),
			$toastBody
		).toast('show')
	},

	freshToastSmall: function($toastBody, autohide, type){
		return $("<div/>",{
			'class':'toast mx-5 align-items-center' + type,
			'role':'alert',
			'aria-live':'assertive',
			'aria-atomic':true,
			'data-autohide':true,
			'data-delay':autohide
		}).append(
			$("<div/>",{
				'class':'d-flex'
			}).append(
				$toastBody,
				$('<button/>',{
					'type':'button',
					'class':'btn-close me-2 m-auto',
					'data-bs-dismiss':'toast',
					'aria-label':'close'
				})
			)
		).toast('show')
	},

	popToastMessage:function(txt, autohide, small = false, type = 'primary'){
		if (!_ui.toasts.toasts_allowed) return false;
		let $toastBody = $('<div/>',{
			'class':'toast-body'
		}).text(txt);

		let typeText = ' text-white border-0 bg-' + type;
		let func = small ? _ui.freshToastSmall : _ui.freshToast

		$('#toast_alerts').append(func($toastBody, autohide, typeText));

		// Delete the toasts once they have served their purpose
		setTimeout(function() {
			let tt = $('#toast_alerts').find('.toast:not(.pendingremoval)').first();
			tt.addClass('pendingremoval').fadeOut(500);
			setTimeout(function () {
				tt.remove();
			}, 500);
		},autohide + 500);
	},

	// TODO: Figure out why these auto-close, they shouldn't!
	popToastAction:function(txt, yesTxt, noTxt, successCallback) {
		let $toastBody = $('<div/>',{
			'class':'toast-body'
		}).append(
			$('<p/>',{
				'class':'fs-6'
			}).text(txt),
			$("<div/>",{
				'class':'btn-group',
				'role':'group'
			}).append(
				$("<button/>",{"class":"btn btn-success"}).text(yesTxt).on("click enter", successCallback),
				$("<button/>",{"class":"btn btn-danger"}).text(noTxt).on("click enter", _ui.burnToastAction)
			)
		);

		$("#toast_actions").append(
			_ui.freshToast(
				$toastBody, false
			)
		);
	},

	burnToastAction:function(){
		$('#toast_actions').empty();
	}

};
