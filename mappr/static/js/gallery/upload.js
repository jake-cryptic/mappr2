let _upload = {

	_csrf: '',
	_headers: {},

	url: '/collections/upload',
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
			limit:10
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
