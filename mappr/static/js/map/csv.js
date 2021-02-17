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
		v.csv.conf['before'] = v.csv.parseBefore;
		v.csv.conf['step'] = v.csv.parseStep;
		v.csv.conf['complete'] = v.csv.parseComplete;

		// Assign event listener
		$("input[type=file]#csv_import").on("change", function(e) {
			v.csv.parseFile($(this).prop('files')[0]);
			return;
			let fileReader = new FileReader();

			fileReader.onload = function () {
				v.csv.parse(fileReader.result);
			};

			fileReader.readAsDataURL(
				$(this).prop('files')[0]
			);
		})
	},

	parseBefore: function(file, inputElem) {
		console.log(file);
		console.log(inputElem);
	},

	parseStep: function(row, parser) {
		let r = row.data;
		console.log(row.data);

		let point = {
			lat: r.lat || r.latitude || r.y || 0,
			lng: r.lng || r.lon || r.longitude || r.x || 0,
			text: ""
		};

		if (point.lat === 0 || isNaN(point.lat) || point.lng === 0 || isNaN(point.lng)) {
			v.csv.errors.push(
				row
			);
			return;
		}

		let m = new L.marker(
			[point.lat, point.lng],
			{
				draggable:false,
				autoPan:true,
				icon: v.m.ico.csv
			}
		);

		if (point.text !== "") {
			m.bindTooltip(point.text, {
				permanent: true,
				direction: 'bottom',
				className: 'marker_label'
			});
		}

		v.csv.dataPoints.push(m);
		v.m.map.addLayer(v.csv.dataPoints[v.csv.dataPoints.length-1]);
	},

	parseComplete: function(result, par) {
		console.log("done")
	},

	parseFile:function(f) {
		v.csv.files.push(
			Papa.parse(f, v.csv.conf)
		);
	},

	parse:function(text) {
		let raw = atob(text);
		v.csv.files.push(
			Papa.parse(raw, v.csv.conf)
		);
	}

};
