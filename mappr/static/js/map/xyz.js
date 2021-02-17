/*
	Handles XYZ "Slippy" Tiles
*/

const O2_TMS_BASE = "https://68aa7b45-tiles.spatialbuzz.net/tiles/o2_uk-";
const O2_TMS_VER = 167;
//const EE_TMS_BASE = "https://maps.ee.co.uk//geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const EE_TMS_BASE = "https://coverage.ee.co.uk/geowebcache/service/gmaps?&zoom={z}&x={x}&y={y}&format=image/png&Layers=";
const THREE_TMS_BASE = "http://www.three.co.uk/static/images/functional_apps/coverage/";
const CM_TMS_BASE = "https://api.cellmapper.net/v6/getTile?MCC=234&MNC=";

let _xyz = {

	opacity:0.5,

	tiles:{
		"O2-UK":{
			"CM-4G":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=0",
			"CM-L18":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=3",
			"CM-L21":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=1",
			"CM-L23":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=40",
			"CM-L08":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=20",
			"CM-L09":CM_TMS_BASE + "10&RAT=LTE&z={z}&x={x}&y={y}&band=8",
			"3g2100-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_data/{z}/{x}/{y}.png",
			"3g2100":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_data/{z}/{x}/{y}.png",
			"3g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_datacombined/{z}/{x}/{y}.png",
			"4g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_lte/{z}/{x}/{y}.png",
			"LTE-M":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_ltem/{z}/{x}/{y}.png",
			"5g-1B":O2_TMS_BASE + "v" + (O2_TMS_VER - 1) + "/styles/o2_uk_v" + (O2_TMS_VER - 1) + "_5g/{z}/{x}/{y}.png",
			"5g":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_5g/{z}/{x}/{y}.png",
			"VoLTE":O2_TMS_BASE + "v" + O2_TMS_VER + "/styles/o2_uk_v" + O2_TMS_VER + "_volte/{z}/{x}/{y}.png"
		},
		"Three-UK":{
			"CM-4G":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=0",
			"CM-L18":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=3",
			"CM-L21":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=1",
			"CM-L14":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=32",
			"CM-L08":CM_TMS_BASE + "20&RAT=LTE&z={z}&x={x}&y={y}&band=20",
			"3g":THREE_TMS_BASE + "Fast/{z}/{x}/{y}.png",
			"4g":THREE_TMS_BASE + "LTE/{z}/{x}/{y}.png",
			"4g800":THREE_TMS_BASE + "800/{z}/{x}/{y}.png",
			"5g":THREE_TMS_BASE + "FiveG/{z}/{x}/{y}.png",
		},
		"Vodafone-UK":{
			"CM-4G":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=0",
			"CM-L18":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=3",
			"CM-L21":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=1",
			"CM-L26":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=7",
			"CM-L08":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=20",
			"CM-L09":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=8",
			"CM-L26T":CM_TMS_BASE + "15&RAT=LTE&z={z}&x={x}&y={y}&band=38",
		},
		"EE":{
			"CM-4G":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=0",
			"CM-L21":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=1",
			"CM-L18":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=3",
			"CM-L26":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=7",
			"CM-L08":CM_TMS_BASE + "30&RAT=LTE&z={z}&x={x}&y={y}&band=20",
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

	append_html:function(){
		// TODO: Move this to UI.js
		for (let op in _xyz.tiles) {
			let el = $("<div/>");
			el.append($("<h4/>").text(op));

			for (let tile in _xyz.tiles[op]) {
				el.append(
					$("<button/>",{
						"class":"btn btn-dark btn-sm",
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

		_xyz.tile_layer = new L.TileLayer(server, {attribution: attr, opacity: _xyz.opacity});
		_map.state.map.addLayer(_xyz.tile_layer);
	}

};
