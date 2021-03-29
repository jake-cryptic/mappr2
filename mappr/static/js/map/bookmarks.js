/*
	Allows users to manage their bookmarks
*/

let _bookmarks = {

	list: [],

	init: function () {
		_bookmarks.reloadUi();
		_bookmarks.assignEvents();
		console.log('[Bookmarks]-> Initialised');
	},

	assignEvents: function () {
		$("#bookmarks_reload").on("click enter", _bookmarks.getList);
		$("#bookmarks_new").on("click enter", _bookmarks.createBookmark);
	},

	reloadUi: function () {
		_bookmarks.getList(function (data) {
			$('#bookmarks_list').empty();

			if (data.response.length === 0 || data.error === true) {
				let txt = data.error === true ? data.msg : 'No bookmarks found';

				$('#bookmarks_list').append(
					$('<tr/>').append(
						$('<td/>', {
							'colspan': 3
						}).text(txt)
					)
				);
				return;
			}

			data.response.forEach(function (point) {
				console.log(point);
				$('#bookmarks_list').append(
					$("<tr/>", {
						"data-id": point.id,
						"data-rat": 'lte',
						"data-mcc": point.mcc,
						"data-mnc": point.mnc,
						"data-lat": point.lat,
						"data-lng": point.lng,
						"data-zoom": point.zoom,
					}).on("click enter", _bookmarks.goToBookmark).append(
						$("<td/>").text(point.mcc + ' ' + point.mnc),
						$("<td/>").text(point.comment),
						$("<td/>").text(point.created)
					)
				);
			});
		});
	},

	goToBookmark: function () {
		_app.mcc = $(this).data('mcc');
		_app.mnc = $(this).data('mnc');

		let lat = $(this).data("lat");
		let lng = $(this).data("lng");
		let zoom = $(this).data("zoom") || 16;

		_history.updateUrl();
		_map.setLocation(lat, lng, zoom);
	},

	createBookmark: function () {
		let comment = prompt('This will create a bookmark of the current map location.\nAdd a comment to your bookmark?', '');
		_bookmarks.add(comment);
	},

	deleteBookmark: function () {
		let conf = confirm('Are you sure you want to delete this bookmark?');

		if (!conf) {
			return;
		}

		let id = $(this).data('id');
		let mcc = $(this).data('mcc');
		let mnc = $(this).data('mnc');
		let rat = $(this).data('rat');

		_bookmarks.remove(id, rat, mcc, mnc);
	},

	add: function (comment = 'No comment') {
		let xyz = _map.getMapXyz();

		let postData = {
			'rat': _app.rat,
			'mcc': _app.mcc,
			'mnc': _app.mnc,

			'lat': xyz.lat,
			'lng': xyz.lng,
			'zoom': xyz.zoom,

			'comment': comment
		};

		$.post('api/bookmark/create', postData).done(function (resp) {
			console.log(resp);
			_bookmarks.reloadUi();
		});
	},

	remove: function (removeId, rat, mcc, mnc) {
		let postData = {
			'rat': rat,
			'mcc': mcc,
			'mnc': mnc,
			'id': removeId
		};

		$.post('api/bookmark/delete', postData).done(function (resp) {
			console.log(resp);
		});
	},

	getList: function (cb) {
		let getData = {
			'rat': _app.rat,
			'mcc': _app.mcc,
			'mnc': _app.mnc
		};

		$.get("api/bookmark/get", getData).done(function (resp) {
			cb(resp);
		});
	}
};
