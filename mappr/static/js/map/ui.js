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

	// TODO: Make it so that a new toast is created each time and they stack
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
			$("<button/>",{"class":"btn btn-danger"}).text(noTxt).on("click enter", _ui.burnToastAction)
		);

		$("#toast_action_required").attr('data-autohide', false).toast('show');
	},

	burnToastAction:function(){
		$('#toast_action_required').attr('data-autohide', true).toast('hide');
	}

};
