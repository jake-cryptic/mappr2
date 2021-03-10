/*

*/

let _table = {

	html:null,

	init:function() {
		_table.html = $("#results_tbl");
		console.log('[Table]-> Initialised');
	},

	addData:function(data) {
		_table.html.empty();

		if (!data || data.length === 0) {
			_table.html.append(
				$('<tr/>').append(
					$('<td/>',{
						'colspan':3
					}).text('No nodes in map area')
				)
			);
		}

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
				"class":"bb",
				"data-lat":point.lat,
				"data-lng":point.lng
			}).on("click enter",_map.goToHereData).append(
				$("<td/>").text(point.mcc + ' ' + point.mnc),
				$("<td/>").text(point.node_id),
				$("<td/>").text(getSectors())
			)
		);
	}

};
