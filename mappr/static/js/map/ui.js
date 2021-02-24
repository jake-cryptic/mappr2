/*
	Handles updating the UI
*/

let _ui = {

	current_modal: null,

	init:function(){
		_ui.controls.init();
		console.log('[UI]-> Initialised');
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

			// TODO: set value depending on load from history URL
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

			console.log('[UI]-> Initialised');
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

		osmQuery: function(){
			_map.osm.doLocationSearch(
				$("#world_location_search").val()
			);
		},

		updateSectorList: function(){
			let $list = $("#sector_list");
			$list.empty();

			let mncs = Object.keys(_api.data.current_mcc);
			for (let i = 0, l = mncs.length; i < l; i++) {
				let mncSectors = _api.data.current_mcc[mncs[i]];

				// If an mnc is selected, don't show other mnc sectors
				if (_app.mnc !== 0) {
					if (parseInt(mncs[i]) !== _app.mnc) continue;
				}

				$mnc = $('<div/>', {
					'id':'sectors_list_mnc' + mncs[i]
				});

				if (mncSectors.length > 50) {
					$mnc.append('too many sectors too display here.');
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
					}).text('Sector IDs for mnc: ' + mncs[i]),
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

	displayMultipleNodeResults: function(results) {
		$html = $('<tbody/>');

		results.forEach(function(r){
			$html.append(
				$('<tr/>',{
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
		el.innerText = 'Loading...'

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
		$html = $('<tbody/>');

		results = [];
		results.forEach(function(r){
			$html.append(
				$('<tr/>',{
					'data-lat':r.lat,
					'data-lng':r.lng,
					'data-zoom': 17
				}).on('click enter', _map.goToHereData).append(
					$('<td/>').text(r.mnc),
					$('<td/>').text(r.node_id),
					$('<td/>').text(r.lat),
					$('<td/>').text(r.lng)
				)
			)
		});

		_ui.openModal(
			'Site History for: ' + mcc + '-' + mnc + ':' + enb,
			$('<div/>').append(
				$('<table/>', {
					'class':'table table-striped'
				}).append(
					$('<thead/>').append(
						$('<tr/>').append(
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
		alert("Not yet " + mnc + " " + enb);
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
		console.log(txt);
		let $toastBody = $('<div/>',{
			'class':'toast-body'
		}).text(txt);

		let typeText = ' text-white border-0 bg-' + type;
		let func = small ? _ui.freshToastSmall : _ui.freshToast

		$('#toast_alerts').append(func($toastBody, autohide, typeText));

		// Delete the toasts once they have served their purpose
		setTimeout(function() {
			console.log('removing',txt);
			let tt = $('#toast_alerts').find('.toast:not(.pendingremoval)').first();
			tt.addClass('pendingremoval').fadeOut(500);
			console.log(tt.text());
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
