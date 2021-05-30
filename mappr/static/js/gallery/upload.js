let _upload = {

	_csrf: '',
	_headers: {},

	url: '/collections/upload',
	uppy: null,

	init: function () {
		_upload._csrf = $('#csrf_token').data('value');

		_upload.initialiseUppy();

		$('#geolocation').on('click enter', _upload.initLocation);
	},

	initLocation: function () {
		function report(state) {
			if (state !== 'denied') {
				navigator.geolocation.getCurrentPosition(function (position) {
					console.log('Geolocation permissions granted');
					console.log('Latitude:' + position.coords.latitude);
					console.log('Longitude:' + position.coords.longitude);
				});
			}
		}

		navigator.permissions.query({
			name: 'geolocation'
		}).then(function (result) {
			switch (result.state) {
				case 'granted':
				case 'prompt':
					$('#geolocation').addClass('btn-success').removeClass('btn-danger').removeClass('btn-info');
					report(result.state);
					break;
				case 'denied':
					$('#geolocation').show().addClass('btn-danger').removeClass('btn-success').removeClass('btn-info');
					report(result.state);
					break;
				default:
					console.error('Unknown');
					break;
			}

			result.onchange = function () {
				report(result.state);
			};
		});
	},

	initialiseUppy: function () {
		_upload._headers['X-CSRFToken'] = _upload._csrf;

		_upload.uppy = Uppy.Core({
			debug: true,
			autoProceed: false,
			restrictions: {
				maxFileSize: 1024 * 1024 * 14,
				maxNumberOfFiles: 32,
				allowedFileTypes: ['image/*']
			},
			headers: _upload._headers
		})
			.use(Uppy.XHRUpload, {
				// TODO: https://uppy.io/docs/xhr-upload/#getResponseError-responseText-response
				endpoint: _upload.url,
				headers: _upload._headers,
				limit: 10
			})
			.use(Uppy.DropTarget, {target: document.body})
			.use(Uppy.Webcam)
			.use(Uppy.Dashboard, {
				inline: true,
				width: 1920,
				height: $('#add_files_area').height(),
				target: '#add_files_area',
				theme: 'auto',
				replaceTargetContent: true,
				showProgressDetails: true,
				proudlyDisplayPoweredByUppy: false,
				note: 'Maximum file size: 12MB',
				autoOpenFileEditor: false,
				metaFields: [
					{id: 'name', name: 'Name', placeholder: 'Filename'},
					{id: 'alt', name: 'Alt-Text', placeholder: 'Describe the image for those with sight-impairments'},
					{id: 'description', name: 'Description', placeholder: 'Add a comment about the image'}
				],
				plugins: ['Webcam'],
			})
			.use(Uppy.ImageEditor, {target: Uppy.Dashboard})
			.use(Uppy.GoldenRetriever);
	}

};

_upload.init();
