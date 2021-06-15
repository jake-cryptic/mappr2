let Graph = function () {
	this.ctx = null;
	this.chart = null;

	this.config = {
		type: 'scatter',
		data: {
			datasets: []
		},
		options: {
			responsive: true,
			animation: {
				duration: 0
			},
			hover: {
				animationDuration: 0
			},
			responsiveAnimationDuration: 0,
			maintainAspectRatio: !isMobileDevice(),
			title: {
				display: true,
				text: 'Carrier Comparison'
			},
			scales: {
				xAxes: [{
					display: true,
					type: 'time',
					displayFormats: {
						quarter: 'YYYY MMM D'
					},
					scaleLabel: {
						display: true,
						labelString: 'Time'
					}
				}],
				yAxes: [{
					display: true,
					scaleLabel: {
						display: true,
						labelString: '# of sites'
					},
					beginAtZero: false
				}]
			}
		}
	};

	this.init = function (id) {
		this.ctx = document.getElementById(id).getContext('2d');
		this.chart = new Chart(this.ctx, this.config);
	};

	this.getColor = function (str) {
		return "#" + MD5(str).substr(0, 6);
	};

	this.refresh = function () {
		this.chart.update();
	};

	this.lineFormat = function () {
		return {
			label: 'No Title',
			backgroundColor: '#000',
			borderColor: '#000',
			data: [],
			showLine: true,
			fill: false,
			tension: 0
		};
	}

	this.addData = function (data) {
		let newLine = this.lineFormat();

		this.config.data.datasets.push(newLine);
		this.refresh();
	};

	this.clearChart = function () {
		this.config.data.datasets = [];
		this.refresh();
	};

	this.toggleFill = function () {
		for (let i = 0; i < this.config.data.datasets.length; i++) {
			this.config.data.datasets[i].fill = !this.config.data.datasets[i].fill;
		}
		this.refresh();
	}

};
