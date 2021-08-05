/*
	Has the data
*/

let _data = {
	"234": {
		"country_name": "United Kingdom",
		"country_short": "UK",
		"mobile_spectrum_url": "https://mobilespectrum.org/united_kingdom",
		"providers": {
			"4": {
				"name": "Ofcom Shared Access",
				"short": "Shared Access",
				"website": "https://ofcom.org.uk",
				"sectorInfo": function (enb, sectorId) {
					return '?';
				}
			},
			"10": {
				"name": "O2-UK",
				"short": "O2",
				"website": "https://o2.co.uk",
				"backgroundColor": "#0019A5",
				"textColor": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [23, 68]) && enb >= 500000) ret += "SpiderCloud";
					if (findItem(sectorId, [115, 125, 135, 145, 155, 165])) ret += (enb >= 500000 ? "1 " : "40C1 ");
					if (findItem(sectorId, [114, 124, 134, 144, 154, 164])) ret += (enb >= 500000 ? "3 " : "1 ");
					if (findItem(sectorId, [110, 120, 130, 140, 150, 160])) ret += "20 ";
					if (findItem(sectorId, [112, 122, 132])) ret += "8 ";
					if (findItem(sectorId, [116, 126, 136, 146, 156, 166])) ret += (enb >= 500000 ? "40C1 " : "3 ");
					if (findItem(sectorId, [117, 127, 137, 147, 157, 167])) ret += "40C2";
					return ret;
				}
			},
			"15": {
				"name": "Vodafone-UK",
				"short": "Vodafone",
				"website": "https://www.vodafone.co.uk/",
				"background": "#e60000",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [15, 25, 35, 45, 55, 65])) ret += (enb >= 500000 ? "1 " : "?");
					if (findItem(sectorId, [14, 24, 34, 44, 54, 64])) ret += "1 ";
					if (findItem(sectorId, [16, 26, 36, 46, 56, 66])) ret += "3 ";
					if (findItem(sectorId, [18, 28, 38, 48, 58, 68])) ret += "7 ";
					if (findItem(sectorId, [12, 22, 32])) ret += "8 ";
					if (findItem(sectorId, [10, 20, 30, 40, 50, 60])) ret += "20 ";
					if (findItem(sectorId, [19, 29, 39, 49, 59, 69])) ret += "38";
					return ret;
				}
			},
			"20": {
				"name": "Three-UK",
				"short": "Three",
				"website": "http://www.three.co.uk/",
				"background": "#000",
				"text": "#fff",
				"ratList": ['UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [71, 72, 73, 74, 75, 76])) ret += "1 ";
					if (findItem(sectorId, [0, 1, 2, 3, 4, 5])) ret += "3 ";
					if (findItem(sectorId, [16])) ret += "3SC ";
					if (findItem(sectorId, [6, 7, 8])) ret += "20 ";
					if (findItem(sectorId, [91, 92, 93])) ret += "28 ";
					return ret;
				}
			},
			"30": {
				"name": "Everything Everywhere",
				"short": "EE",
				"website": "https://ee.co.uk",
				"background": "#007b85",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [21, 22, 23])) ret += "? ";
					if (findItem(sectorId, [18, 19, 20])) ret += "1 ";
					if (findItem(sectorId, [0, 1, 2])) ret += "3P ";
					if (findItem(sectorId, [3, 4, 5])) ret += "3S ";
					if (findItem(sectorId, [6, 7, 8])) ret += "7P ";
					if (findItem(sectorId, [9, 10, 11])) ret += "7S ";
					if (findItem(sectorId, [15, 16, 17])) ret += "7T ";
					if (findItem(sectorId, [12, 13, 14])) ret += "20 ";
					if (findItem(sectorId, [24])) ret += "3SC ";
					return ret;
				}
			},
			"31": {
				"name": "EE ESN Only",
				"short": "EE ESN Only",
				"website": "https://ee.co.uk",
				"background": "#007b85",
				"text": "#fff",
				"sectorInfo": function (enb, sectorId) {
					return _data['234']['providers']['30']['sectorInfo'](enb, sectorId);
				}
			},
			"32": {
				"name": "EE ESN",
				"short": "EE ESN",
				"website": "https://ee.co.uk",
				"background": "#007b85",
				"text": "#fff",
				"sectorInfo": function (enb, sectorId) {
					return _data['234']['providers']['30']['sectorInfo'](enb, sectorId);
				}
			},
			"33": {
				"name": "Orange",
				"short": "Orange",
				"website": "https://ee.co.uk",
				"background": "#007b85",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS'],
				"sectorInfo": function (enb, sectorId) {
					return _data['234']['providers']['30']['sectorInfo'](enb, sectorId);
				}
			},
			"55": {
				"name": "Sure",
				"short": "Sure",
				"background": "#000",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE'],
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			},
			"58": {
				"name": "Manx Telecom",
				"short": "Manx",
				"background": "#000",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE'],
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			}
		}
	},

	"238": {
		"country_name": "Denmark",
		"country_short": "DK",
		"mobile_spectrum_url": "https://mobilespectrum.org/denmark",
		"providers": {
			"2": {
				"name": "TT-Netværket (Telenor)",
				"short": "Telenor",
				"website": "https://www.tt-network.dk/",
				"background": "#663989",
				"text": "#fff",
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			},
			"6": {
				"name": "Hi3G Denmark",
				"short": "3",
				"website": "https://www.3.dk/",
				"background": "#f37423",
				"text": "#fff",
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			},
			"20": {
				"name": "TT-Netværket (Telia)",
				"short": "Telia",
				"website": "https://www.tt-network.dk/",
				"background": "#663989",
				"text": "#fff",
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			}
		}
	},

	"262": {
		"country_name": "Germany",
		"country_short": "DE",
		"mobile_spectrum_url": "https://mobilespectrum.org/germany",
		"providers": {
			"1": {
				"name": "Telekom",
				"short": "Telekom",
				"website": "https://telekom.de/",
				"background": "#ff0090",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					return sectorId.length + ' sectors';
				}
			},
			"2": {
				"name": "Vodafone-DE",
				"short": "Vodafone",
				"website": "https://www.vodafone.de/",
				"background": "#e60000",
				"text": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [19, 20, 21])) ret += "1 ";
					if (findItem(sectorId, [8, 9, 10])) ret += "3 ";
					if (findItem(sectorId, [5, 6, 7])) ret += "7 ";
					if (findItem(sectorId, [25, 26, 27])) ret += "8 ";
					if (findItem(sectorId, [1, 2, 3])) ret += "20 ";
					if (findItem(sectorId, [31, 32, 33])) ret += "28 ";
					if (findItem(sectorId, [43, 44, 45])) ret += "38-1 ";
					if (findItem(sectorId, [151, 152, 153])) ret += "38-2 ";
					return ret;
				}
			},
			"3": {
				"name": "O2-DE",
				"short": "O2",
				"website": "https://o2.de",
				"backgroundColor": "#004080",
				"textColor": "#fff",
				"ratList": ['GSM', 'UMTS', 'LTE', 'NR'],
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					let isOpenRan = false;
					if (findItem(sectorId, [11, 12, 21, 22, 23, 41, 42, 43, 52, 53])) {
						isOpenRan = true;
					}

					ret += isOpenRan ? 'OpenRAN: ' : '';

					if (isOpenRan) {
						if (findItem(sectorId, [51, 52, 53])) ret += "1 ";
						if (findItem(sectorId, [41, 42, 43])) ret += "3 ";
						if (findItem(sectorId, [61, 62, 63])) ret += "7 ";
						if (findItem(sectorId, [21, 22, 23])) ret += "20 ";
						if (findItem(sectorId, [11, 12, 13])) ret += "28 ";
					} else {
						if (findItem(sectorId, [37, 38, 39, 40])) ret += "1 ";
						if (findItem(sectorId, [25, 26, 27, 28])) ret += "3 ";
						if (findItem(sectorId, [13, 14, 15, 16])) ret += "7 ";
						if (findItem(sectorId, [61, 62, 63])) ret += "8 ";
						if (findItem(sectorId, [1, 2, 3, 4])) ret += "20 ";
						if (findItem(sectorId, [49, 50, 51])) ret += "28 ";
					}

					return ret;
				}
			}
		}
	},

	"368": {
		"country_name": "Cuba",
		"country_short": "CU",
		"mobile_spectrum_url": null,
		"providers": {
			"1": {
				"name": "Cubacel",
				"short": "Cubacel",
				"website": "http://www.etecsa.cu/",
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [1, 2, 3])) ret += "3C1 ";
					if (findItem(sectorId, [4, 5, 6])) ret += "3C2 ";
					return ret;
				}
			}
		}
	},

	"621": {
		"country_name": "Nigeria",
		"country_short": "NG",
		"mobile_spectrum_url": null,
		"providers": {
			"20": {
				"name": "Airtel",
				"short": "Airtel",
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [1, 2, 3])) ret += "3 ";
					if (findItem(sectorId, [11, 12, 13])) ret += "7 ";
					if (findItem(sectorId, [21, 22, 23])) ret += "8 ";
					return ret;
				}
			},
			"30": {
				"name": "MTN",
				"short": "MTN",
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [81, 82, 83])) ret += "3 ";
					if (findItem(sectorId, [4, 5, 6])) ret += "7 ";
					if (findItem(sectorId, [1, 2, 3])) ret += "20 ";
					if (findItem(sectorId, [10, 11, 12])) ret += "28 ";
					return ret;
				}
			},
			"50": {
				"name": "Glo",
				"short": "Glo",
				"sectorInfo": function (enb, sectorId) {
					let ret = '';
					if (findItem(sectorId, [4, 5, 6])) ret += "3 ";
					if (findItem(sectorId, [1, 2, 3])) ret += "28 ";
					return ret;
				}
			}
		}
	}
};
