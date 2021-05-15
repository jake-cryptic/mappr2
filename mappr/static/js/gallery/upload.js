let _upload = {

	_csrf: '',
	_headers: {},

	url:'/collections/upload',
	uppy: null,

	init: function() {
		_upload._csrf = $('#csrf_token').data('value');

		_upload.initialiseUppy();
	},

	initialiseUppy: function() {
		_upload._headers['X-CSRFToken'] = _upload._csrf;

		_upload.uppy = Uppy.Core({
			debug: true,
			headers: _upload._headers
		});

		_upload.uppy.use(Uppy.Webcam);
		_upload.uppy.use(Uppy.Dashboard, {
			inline: true,
			target: '#add_files_area',
			plugins: ['Webcam'],
		});
		_upload.uppy.use(Uppy.XHRUpload, {
			endpoint: _upload.url,
			headers: _upload._headers
		});
	}

};

_upload.init();
