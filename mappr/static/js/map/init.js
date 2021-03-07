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
		_app._changeRat($(this).val());
	},

	_changeRat: function(newRat){
		_app.rat = newRat;
		_history.updateUrl();
		_map.reloadMap();
	},

	changeMcc: function(){
		_app._changeMcc($(this).val());
	},

	_changeMcc: function(newMcc){
		_app.mcc = parseInt(newMcc);
		_app.mnc = 0;
		_ui.populateMncSelector(_app.mcc);
		_ui.popToastMessage('Mobile Country Code changed to: ' + newMcc, 1000, true,'info');
		_api.data.getMccSectors();
		_history.updateUrl();
		_map.reloadMap();
	},

	changeMnc: function(){
		_app._changeMnc($(this).val());
	},

	_changeMnc: function(newMnc) {
		_app.mnc = parseInt(newMnc);
		_ui.popToastMessage('Mobile Network Code changed to: ' + newMnc, 1000, true,'info');
		_history.updateUrl();
		_map.reloadMap();
	}

};

_app.init();
