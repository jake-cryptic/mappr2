/*

*/

let _table = {

	html:null,

	init:function() {
		_table.html = $("#results_tbl");
	},

	addData:function(data) {
		for (let i = 0; i < data.length; i++) {
			_table.addPointToTable(data[i]);
		}
	},

	addPointToTable: function(point) {
		let $r = _table.html;

		function getSectors(){
			return Object.keys(point.sectors).join(", ");
		}

		$r.append(
			$("<tr/>",{
				"data-lat":point.lat,
				"data-lng":point.lng
			}).on("click enter",v.goToHereData).append(
				$("<td/>").text(point.mnc),
				$("<td/>").text(point.id),
				$("<td/>").text(getSectors())
			)
		);
	}

};
