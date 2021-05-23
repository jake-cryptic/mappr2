let _upload = {

	_csrf: '',
	_headers: {},

	url: '/map/upload/csv',
	uppy: null,

	init: function () {
		_upload._csrf = $('#csrf_token').data('value');

		_upload.initialiseUppy();
	},

	initialiseUppy: function () {
		_upload._headers['X-CSRFToken'] = _upload._csrf;

		_upload.uppy = Uppy.Core({
			debug: true,
			autoProceed: false,
			restrictions: {
				maxFileSize: 1024 * 1024 * 10,
				maxNumberOfFiles: 1,
				allowedFileTypes: ['text/csv']
			},
			headers: _upload._headers
		})
		.use(Uppy.XHRUpload, {
			endpoint: _upload.url,
			headers: _upload._headers
		})
		.use(Uppy.DropTarget, {target: document.body})
		.use(Uppy.Dashboard, {
			inline: true,
			width: 1920,
			height: $('#add_files_area').height(),
			target: '#add_files_area',
			theme: 'auto',
			replaceTargetContent: true,
			showProgressDetails: true,
			proudlyDisplayPoweredByUppy: false,
			note: 'Maximum file size: 10MB',
			autoOpenFileEditor: false,
			metaFields: [
				{id: 'name', name: 'Name', placeholder: 'Filename'},
				{id: 'alt', name: 'Alt-Text', placeholder: 'Describe the image for those with sight-impairments'}
			],
		})
		.use(Uppy.GoldenRetriever);
	}

};

_upload.init();
