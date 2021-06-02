/*
	Handles CSV display
*/

let _csv = {

	conf: {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true,
		worker: false
	},

	icons: {},

	markers: [],

	dataPoints: [],
	errors: [],
	files: {},

	cFileName: '',

	osgb: null,

	init: function () {
		// Check for browser file support for this feature
		// TODO: Don't init if we don't support this API
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
			$("#files").empty().text('File API not supported');
			return;
		}

		// Just in case we need to convert easting northing coords
		_csv.osgb = new GT_OSGB();

		// Add callback functions to config
		_csv.conf['step'] = _csv.parseStep;
		_csv.conf['complete'] = _csv.parseComplete;

		// Assign event listener
		$("input[type=file]#csv_import").on("change", function (e) {
			let file = $(this).prop('files')[0];
			_csv.parseFile(file);
		});

		console.log('[CSV]-> Initialised')
	},

	parseStep: function (row, parser) {
		let r = row.data;
		//console.log(row.data);

		// TODO: Convert header names to lower case to find coordinate columns
		// TODO: Check rows that could match lat/lng/x/y if no headers found
		let point = {
			lat: r.lat || r.latitude || r.y || r.Y || 0,
			lng: r.lng || r.lon || r.longitude || r.x || r.X || 0,
			text: ""
		};

		if ((r.easting && r.northing) || (point.lat > 100 && point.lng > 100)) {
			console.log(r);
			let easting = r.easting || r.x || r.X;
			let northing = r.northing || r.y || r.Y;

			_csv.osgb.setGridCoordinates(easting, northing);

			let wgs84 = _csv.osgb.getWGS84();
			point.lat = wgs84.latitude;
			point.lng = wgs84.longitude;
		}

		if (point.lat === 0 || isNaN(point.lat) || point.lng === 0 || isNaN(point.lng)) {
			_csv.errors.push(
				row
			);
			return;
		}

		let m = new L.marker(
			[point.lat, point.lng],
			{
				virtual: true,
				draggable: false,
				autoPan: true,
				icon: createUniqueMarker(_csv.cFileName)
			}
		);

		if (point.text !== "") {
			m.bindTooltip(point.text, {
				permanent: true,
				direction: 'bottom',
				className: 'marker_label'
			});
		}

		function createUniqueMarker(filename) {
			if (!_csv.icons[filename]) {
				let sectorMD5 = MD5(filename);
				let sectorColor = chroma('#' + sectorMD5.substring(0, 6));
				sectorColor = sectorColor.darken();

				_csv.icons[filename] = L.BeautifyIcon.icon({
					icon: 'far fa-circle icon-class',
					shadowSize: [0, 0],
					iconShape: 'marker',
					borderColor: '#fff',
					borderWidth: 1,
					backgroundColor: sectorColor.hex(),
					textColor: '#fff'
				});
			}

			return _csv.icons[filename];
		}

		function createPopupText(d) {
			let str = '<table class="table table-striped table-bordered table-sm">';
			let keys = Object.keys(d);
			for (let i = 0; i < keys.length; i++) {
				let value = d[keys[i]];
				if (value === null) continue;
				str += '<tr><td><strong>' + keys[i] + '</strong></td><td>' + d[keys[i]] + '</td></tr>';
			}
			str += '</table>';
			return str;
		}

		m.bindPopup(
			createPopupText(r), _map.items.markerPopupOptions
		);

		_csv.dataPoints.push(m);
		_map.state.map.addLayer(_csv.dataPoints[_csv.dataPoints.length - 1]);
	},

	parseComplete: function (result, par) {
		console.log("[CSV]-> Done parsing file")
	},

	parseFile: function (f) {
		_csv.cFileName = f.name;
		$s = $('#csv_import_file_info');
		$s.text('Parsing file: ' + f.name);

		_csv.files[f.name] = Papa.parse(f, _csv.conf);
		$s.text('Loaded file: ' + f.name);
	}

};
