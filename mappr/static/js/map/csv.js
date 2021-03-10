/*
	Handles CSV display
*/

let _csv = {

	conf:{
		header:true,
		skipEmptyLines:true,
		dynamicTyping: true,
		worker: false
	},

	markers:[],

	dataPoints:[],
	errors:[],
	files:[],

	init:function(){
		// Check for browser file support for this feature
		// TODO: Don't init if we don't support this API
		if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
			$("#files").empty().text('File API not supported');
			return;
		}

		// Add callback functions to config
		_csv.conf['before'] = _csv.parseBefore;
		_csv.conf['step'] = _csv.parseStep;
		_csv.conf['complete'] = _csv.parseComplete;

		// Assign event listener
		$("input[type=file]#csv_import").on("change", function(e) {
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

	parseBefore: function(file, inputElem) {
		console.log(file);
		console.log(inputElem);
	},

	parseStep: function(row, parser) {
		let r = row.data;
		//console.log(row.data);

		let point = {
			lat: r.lat || r.latitude || r.y || 0,
			lng: r.lng || r.lon || r.longitude || r.x || 0,
			text: ""
		};

		if (point.lat === 0 || isNaN(point.lat) || point.lng === 0 || isNaN(point.lng)) {
			_csv.errors.push(
				row
			);
			return;
		}

		let m = new L.marker(
			[point.lat, point.lng],
			{
				draggable:false,
				autoPan:true,
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
			let str = '';
			let keys = Object.keys(d);
			for (let i = 0; i < keys.length; i++) {
				str += keys[i] + ': ' + d[keys[i]] + '<br />';
			}
			return str;
		}

		m.bindPopup(
			createPopupText(r), _map.items.markerPopupOptions
		);

		_csv.dataPoints.push(m);
		_map.state.map.addLayer(_csv.dataPoints[_csv.dataPoints.length-1]);
	},

	parseComplete: function(result, par) {
		console.log("done")
	},

	parseFile:function(f) {
		_csv.files.push(
			Papa.parse(f, _csv.conf)
		);
	},

	parse:function(text) {
		let raw = atob(text);
		_csv.files.push(
			Papa.parse(raw, _csv.conf)
		);
	}

};
