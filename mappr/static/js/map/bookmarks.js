/*
	Allows users to manage their bookmarks
*/

let _bookmarks = {

	list:[],

	assignEvents:function(){
		$("#bookmarks_reload").on("click enter", _bookmarks.getList);

	},

	add:function(comment = 'No comment'){
		let xyz = _map.getMapXyz();

		let postData = {
			'rat': _app.rat,
			'mcc': _app.mcc,
			'mnc': _app.mnc,

			'lat': xyz.lat,
			'lng': xyz.lng,
			'zoom': xyz.zoom,

			'comment': comment
		};

		$.post('api/bookmark/create', postData).done(function(resp){
			console.log(resp);
		});
	},

	remove:function(removeId){
		let postData = {
			'rat': _app.rat,
			'mcc': _app.mcc,
			'mnc': _app.mnc,
			'id': removeId
		};

		$.post('api/bookmark/delete', postData).done(function(resp){
			console.log(resp);
		});
	},

	getList:function(){
		let getData = {
			'rat': _app.rat,
			'mcc': _app.mcc,
			'mnc': _app.mnc
		};

		$.get("api/bookmark/get", getData).done(function(resp){
			return resp;
		});
	}
};
