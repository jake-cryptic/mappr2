/*
	Loads modules and initialises code
*/

const MAPPR_VER = "mappr-v2.0.0b";

let _app = {

	mcc: 234,
	mnc: 0,

	init:function() {
		document.title = "Loading Mappr2";

		_history.loadParams(function(){
			_map.init();
		});
	}

};

_app.init();
