/*
	Allows users to manage their bookmarks
*/

let _bookmarks = {
	assignEvents:function(){
		$("#bookmarks_reload").on("click enter", v.bookmarks.getList);

	},

	add:function(){

	},

	remove:function(){

	},

	getList:function(){
		$.post("api/bookmark-hander", {action:'get'}).done(function(resp){
			console.log(resp);
		});
	}
};
