/*
	Handles XYZ "Slippy" Tiles
*/

const O2_TMS_BASE = "https://68aa7b45-tiles.spatialbuzz.net/tiles/o2_uk-";
const O2_TMS_VER = 170;
//const EE_TMS_BASE = "https://maps.ee.co.uk//geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const EE_TMS_BASE = "https://coverage.ee.co.uk/geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const THREE_TMS_BASE = "https://www.three.co.uk/static/images/functional_apps/coverage/";
const VODAFONE_ESRI_BASE = 'https://mapserver.vodafone.co.uk/arcgis/rest/services/';
const CM_TMS_BASE = "https://api.cellmapper.net/v6/getTile?z={z}&x={x}&y={y}";

let _xyz = {

	opacity:0.5,
	layer_control:null,
	current_layer_list: [],

	tiles:{
		"O2-UK":{
			"G09 Version-1":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_voice/{z}/{x}/{y}.png",
			"G09":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_voice/{z}/{x}/{y}.png",

			"U21 Version-1":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_data/{z}/{x}/{y}.png",
			"U21":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_data/{z}/{x}/{y}.png",

			"U09 + U21":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_datacombined/{z}/{x}/{y}.png",

			"4G Version-1":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_lte/{z}/{x}/{y}.png",
			"4G":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_lte/{z}/{x}/{y}.png",

			"VoLTE":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_volte/{z}/{x}/{y}.png",
			"LTE-M Version-1":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_ltem/{z}/{x}/{y}.png",
			"LTE-M":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_ltem/{z}/{x}/{y}.png",

			"5G Version-1":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_5g/{z}/{x}/{y}.png",
			"5G":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_5g/{z}/{x}/{y}.png"
		},
		"3-UK":{
			"U21":THREE_TMS_BASE + "Fast/{z}/{x}/{y}.png",
			"4G":THREE_TMS_BASE + "LTE/{z}/{x}/{y}.png",
			"L08":THREE_TMS_BASE + "800/{z}/{x}/{y}.png",
			"5G":THREE_TMS_BASE + "FiveG/{z}/{x}/{y}.png",
		},
		"Voda-UK":{
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
			"L08":EE_TMS_BASE + "4g_800_ltea",
			"L18":EE_TMS_BASE + "4g_1800_ltea",
			"L18 DS":EE_TMS_BASE + "4g_1800_ds_ltea",
			"L26":EE_TMS_BASE + "4g_2600_ltea",
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
		_xyz.update_control_layer();
		_xyz.assignEvents();

		console.log('[XYZ]-> Initialised');
	},

	assignEvents: function () {
		$('#cm_tile_add').on('click enter', _xyz.cm.evt);
		$("#operator_tile_opacity").on("change", _xyz.update_opacity);

		_map.state.map.on('overlayadd', _xyz.layer_add);
		_map.state.map.on('overlayremove', _xyz.layer_remove);
	},

	layer_add: function(layer){
		if (layer) {
			let attr = layer.name || 'Unknown';
			_api.track(['trackEvent', 'XYZTiles', 'overlayAdd ' + attr]);

			_xyz.current_layer_list.push(attr);
			_xyz.update_current_layer_text();
		}
	},

	layer_remove: function(layer){
		if (layer) {
			let attr = layer.name || 'Unknown';

			let removeId = _xyz.current_layer_list.indexOf(attr);
			_xyz.current_layer_list.splice(removeId, 1);
			_xyz.update_current_layer_text();
		}
	},

	update_current_layer_text: function () {
		let str = 'Current Layers: <br />';
		_xyz.current_layer_list.forEach(function (layer_name) {
			str += layer_name + ', ';
		});

		if (str.length === 22) {
			str = 'No Layers';
		} else {
			str = str.substr(0, str.length-2);
		}

		$('#operator_current_layer').empty().html(str);
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

	update_control_layer:function(){
		let tileLayers = {};
		for (let op in _xyz.tiles) {
			for (let tile in _xyz.tiles[op]) {
				tileLayers[op + ' ' + tile] = _xyz.get_server_layer(_xyz.tiles[op][tile], op + ' ' + tile);
			}
		}

		// Make layer control selector
		_xyz.layer_control = L.control.layers(null, tileLayers, {
			sortLayers:true
		});

		// Add control box to map
		_map.state.map.addControl(_xyz.layer_control);
	},

	update_opacity:function(){
		_xyz.opacity = $(this).val() / 100;

		let layerKeys = Object.keys(_xyz.layer_control._layers);
		for (let i = 0, l = layerKeys.length; i < l; i++) {
			_xyz.layer_control._layers[layerKeys[i]].layer.setOpacity(_xyz.opacity);
		}
	},

	get_server_layer:function(server, attr) {
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

		return _xyz.tile_layer;
	}

};
