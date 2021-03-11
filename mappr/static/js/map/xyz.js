/*
	Handles XYZ "Slippy" Tiles
*/

const O2_TMS_BASE = "https://68aa7b45-tiles.spatialbuzz.net/tiles/o2_uk-";
const O2_TMS_VER = 167;
//const EE_TMS_BASE = "https://maps.ee.co.uk//geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const EE_TMS_BASE = "https://coverage.ee.co.uk/geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const THREE_TMS_BASE = "https://www.three.co.uk/static/images/functional_apps/coverage/";
const VODAFONE_ESRI_BASE = 'https://mapserver.vodafone.co.uk/arcgis/rest/services/';
const CM_TMS_BASE = "https://api.cellmapper.net/v6/getTile?z={z}&x={x}&y={y}";

let _xyz = {

	opacity:0.5,

	tiles:{
		"O2-UK":{
			"2g-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_voice/{z}/{x}/{y}.png",
			"2g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_voice/{z}/{x}/{y}.png",

			"3g2100-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_data/{z}/{x}/{y}.png",
			"3g2100":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_data/{z}/{x}/{y}.png",
			"3g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_datacombined/{z}/{x}/{y}.png",

			"4g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_lte/{z}/{x}/{y}.png",
			"4g-1B":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_lte/{z}/{x}/{y}.png",
			"VoLTE":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_volte/{z}/{x}/{y}.png",
			"LTE-M":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_ltem/{z}/{x}/{y}.png",

			"5g-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_5g/{z}/{x}/{y}.png",
			"5g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_5g/{z}/{x}/{y}.png"
		},
		"Three-UK":{
			"3g":THREE_TMS_BASE + "Fast/{z}/{x}/{y}.png",
			"4g":THREE_TMS_BASE + "LTE/{z}/{x}/{y}.png",
			"4g800":THREE_TMS_BASE + "800/{z}/{x}/{y}.png",
			"5g":THREE_TMS_BASE + "FiveG/{z}/{x}/{y}.png",
		},
		"Vodafone-UK":{
			'Paknet':VODAFONE_ESRI_BASE + 'Paknet/MapServer',
			'2G-Planned':VODAFONE_ESRI_BASE + 'Vodafone_2G_Live_Service/MapServer',
			'2G-Live':VODAFONE_ESRI_BASE + 'Vodafone_2G_Live_Service/MapServer',
			'3G-Planned':VODAFONE_ESRI_BASE + 'Vodafone_3G_Live_Service/MapServer',
			'3G-Live':VODAFONE_ESRI_BASE + 'Vodafone_3G_Live_Service/MapServer',
			'4G-Planned':VODAFONE_ESRI_BASE + 'Vodafone_4G_Live_Service/MapServer',
			'4G-Live':VODAFONE_ESRI_BASE + 'Vodafone_4G_Live_Service/MapServer',
			'5G-Planned':VODAFONE_ESRI_BASE + 'Vodafone_5G_Live_Service/MapServer',
			'5G-Live':VODAFONE_ESRI_BASE + 'Vodafone_5G_Live_Service/MapServer',
			'IncCrq_Impact':VODAFONE_ESRI_BASE + 'IncCrq_Impact/MapServer',
			'ICImpact_Stage':VODAFONE_ESRI_BASE + 'ICImpact_Stage/MapServer',
		},
		"EE":{
			"4g800":EE_TMS_BASE + "4g_800_ltea",
			"4g1800":EE_TMS_BASE + "4g_1800_ltea",
			"4g1800ds":EE_TMS_BASE + "4g_1800_ds_ltea",
			"4g2600":EE_TMS_BASE + "4g_2600_ltea",
			"2G-old":EE_TMS_BASE + "2g_ltea",
			"3G-old":EE_TMS_BASE + "3g_ltea",
			"4G-old":EE_TMS_BASE + "4g_ltea",
			"5G-old":EE_TMS_BASE + "5g_ltea",
			"2G":EE_TMS_BASE + "2g_ee",
			"3G":EE_TMS_BASE + "3g_ee",
			"4G":EE_TMS_BASE + "4g_ee",
			"5G":EE_TMS_BASE + "5g_ee"
		}
	},

	init: function(){
		_xyz.append_html();
		$('#cm_tile_add').on('click enter', _xyz.cm.evt);
		console.log('[XYZ]-> Initialised');
	},

	append_html:function(){
		// TODO: Move this to UI.js
		for (let op in _xyz.tiles) {
			let el = $("<div/>");
			el.append($("<p/>",{'class':'mt-3 h5'}).text(op));

			for (let tile in _xyz.tiles[op]) {
				el.append(
					$("<button/>",{
						"class":"btn m-1 btn-dark btn-sm",
						"data-op":op,
						"data-tile":tile,
						"data-tileserver":_xyz.tiles[op][tile]
					}).text(tile).on("click enter", _xyz.add_server)
				);
			}

			$("#operator_maps").append(el);
		}

		$("#operator_tile_opacity").on("change", _xyz.update_opacity);
	},

	cm: {

		layers:[],

		evt: function(){
			if (_xyz.cm.layers.length === 0) {
				$('#tile_table').empty();
			}

			let mcc = $('#cm_input_mcc').val();
			let mnc = $('#cm_input_mnc').val();
			let rat = $('#cm_select_rat').val();
			let band = $('#cm_select_band').val();

			_xyz.cm.add_layer(_xyz.cm.layers.length,mcc, mnc, rat, band);
			_xyz.cm.update_table(_xyz.cm.layers.length-1, mcc, mnc, rat, band);
		},

		add_layer: function(newId, mcc, mnc, rat, band){
			let url = CM_TMS_BASE;
			url += '&MCC=' + mcc;
			url += '&MNC=' + mnc;
			url += '&RAT=' + rat;
			url += '&band=' + band;

			_xyz.cm.layers.push(
				new L.TileLayer(url, {
					attribution: 'CellMapper.net',
					opacity: 100
				})
			);
			_map.state.map.addLayer(_xyz.cm.layers[newId]);
		},

		update_table: function (id, mcc, mnc, rat, band) {
			$('#tile_table').append(
				$("<tr/>",{
					"data-id":id
				}).on("click enter", _xyz.cm.removeFromTable).append(
					$("<td/>").text(mcc),
					$("<td/>").text(mnc),
					$("<td/>").text(rat),
					$("<td/>").text(band)
				)
			);
		},

		removeFromTable: function(){
			let id = $(this).data('id');
			$(this).remove();
			_map.state.map.removeLayer(_xyz.cm.layers[id]);
		}

	},

	update_opacity:function(){
		_xyz.opacity = $(this).val() / 100;

		if (_xyz.tile_layer) {
			_xyz.tile_layer.setOpacity(_xyz.opacity);
		}
	},

	add_server:function(){
		let server = $(this).data("tileserver"),
			attr = $(this).data("op") + " " + $(this).data("tile");

		if (_xyz.tile_layer) _map.state.map.removeLayer(_xyz.tile_layer);

		let data = {
			attribution: attr,
			opacity: _xyz.opacity
		};

		switch ($(this).data('op')) {
			case 'Three-UK':
				data['tms'] = true;
				_xyz.tile_layer = new L.TileLayer(server, data);
				break;
			case 'Vodafone-UK':
				data['url'] = server;
				_xyz.tile_layer = new L.esri.dynamicMapLayer(data);
				break;
			default:
				_xyz.tile_layer = new L.TileLayer(server, data);
				break;
		}

		_map.state.map.addLayer(_xyz.tile_layer);
	}

};
