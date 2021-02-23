/*
	Loads modules and initialises code
*/

const MAPPR_VER = "mappr-v2.0.0b";

let _app = {

	rat: "LTE",
	mcc: 234,
	mnc: 0,

	init:function() {
		document.title = "Loading Mappr2";

		_history.loadParams(function(){
			_map.init();
			_ui.init();
			_table.init();
			_api.init();
			document.title = "Mappr2 | Map";
		});

		_csv.init();
		_bookmarks.init();
		_xyz.init();
	},

	changeRat: function(){
		_app.rat = $(this).val();
		_history.updateUrl();
		_map.reloadMap();
	},

	changeMcc: function(){
		_app.mcc = parseInt($(this).val());
		_api.data.getMccSectors();
		_history.updateUrl();
		_map.reloadMap();
	},

	changeMnc: function(){
		_app.mnc = parseInt($(this).val());
		_history.updateUrl();
		_map.reloadMap();
	}

};

_app.init();
