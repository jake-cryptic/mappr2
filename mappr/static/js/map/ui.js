/*
	Handles updating the UI
*/

let _ui = {

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
			$("<button/>",{"class":"btn btn-danger"}).text(noTxt).on("click enter", v.ui.burnToastAction)
		);

		$("#toast_action_required").attr('data-autohide', false).toast('show');
	},
	burnToastAction:function(){
		$('#toast_action_required').attr('data-autohide', true).toast('hide');
	},

};
