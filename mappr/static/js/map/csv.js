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

	markers: [],

	dataPoints: [],
	errors: [],
	files: [],

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
		_csv.conf['before'] = _csv.parseBefore;
		_csv.conf['step'] = _csv.parseStep;
		_csv.conf['complete'] = _csv.parseComplete;

		// Assign event listener
		$("input[type=file]#csv_import").on("change", function (e) {
			_csv.parseFile($(this).prop('files')[0]);
			return;
			let fileReader = new FileReader();

			fileReader.onload = function () {
				_csv.parse(fileReader.result);
			};

			fileReader.readAsDataURL(
				$(this).prop('files')[0]
			);
		});

		console.log('[CSV]-> Initialised')
	},

	parseBefore: function (file, inputElem) {
		console.log(file);
		console.log(inputElem);
	},

	parseStep: function (row, parser) {
		let r = row.data;
		//console.log(row.data);

		let point = {
			lat: r.lat || r.latitude || r.y || 0,
			lng: r.lng || r.lon || r.longitude || r.x || 0,
			text: ""
		};

		if ((r.easting && r.northing) || (point.lat > 100 && point.lng > 100)) {
			console.log(r);
			let easting = r.easting || r.x;
			let northing = r.northing || r.y;

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
				icon: _map.icons.ico.csv
			}
		);

		if (point.text !== "") {
			m.bindTooltip(point.text, {
				permanent: true,
				direction: 'bottom',
				className: 'marker_label'
			});
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
		_csv.files.push(
			Papa.parse(f, _csv.conf)
		);
	},

	parse: function (text) {
		let raw = atob(text);
		_csv.files.push(
			Papa.parse(raw, _csv.conf)
		);
	}

};
