/*
	Handles updating the UI
*/

let _ui = {

	init:function(){
		_ui.controls.init();
		console.log('[UI]-> Initialised');
	},

	controls: {
		init:function() {
			// Button press events
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
		}
	},

	sidebar: {
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
		}
	},

	getSiteAddr: function(el, lat, lng){
		el.innerText = 'Loading...'
		let parent = el.parentElement;
		_map.osm.getApproxLocation(lat, lng, function(data){
			parent.innerHTML = "<strong>Site Address:</strong><br/>" + data;
		});
	},

	getSiteHistory: function(el, mnc, enb){
		alert("Not yet " + mnc + " " + enb);
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
			$('#toast_alerts').find('.toast').first().remove();
		},autohide + 1000);
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
