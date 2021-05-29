/*
	Enables the web-sharing API for elements with data-share attributes
*/

let _maplocation = {

	maps: {},

	init: function () {
		$('[data-map-lat]').each(function() {
			let lat = parseFloat($(this).data('map-lat'));
			let lng = parseFloat($(this).data('map-lng'));
			let elId = genRandomId(8);
			$(this).attr('id', elId).addClass('small-map');

			_maplocation.makeMap($(this), elId, lat, lng);
		});
	},

	makeMap: function($el, id, lat, lng) {
		// Create the map
		_maplocation.maps[id] = L.map(id, {
			fullscreenControl: true,
			fullscreenControlOptions: {
				position: 'topleft'
			},
			preferCanvas: true
		}).setView([round(lat, 6), round(lng, 6)], 12);

		L.control.scale().addTo(_maplocation.maps[id]);
		L.control.locate({
			position: 'topright',
			icon: 'fas fa-map-marker-alt'
		}).addTo(_maplocation.maps[id]);

		let server = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
			attr = '<a href="https://openstreetmap.org">OpenStreetMap</a>';
		_maplocation.maps[id].addLayer(
			new L.TileLayer(server, {
				attribution: attr + " | " + MAPPR_VER,
				maxNativeZoom: 18,
				maxZoom: 22
			})
		);

		L.circle([lat, lng], 5).addTo(_maplocation.maps[id]);
	}

};

_maplocation.init();
