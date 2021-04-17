let uppy = Uppy.Core({
	debug: true,
	headers:{
		"X-CSRFToken": _csrf
	}
});

uppy.use(Uppy.Webcam);
uppy.use(Uppy.Dashboard, {
	inline: true,
	target: '#add_files_area',
	plugins: ['Webcam'],
});
uppy.use(Uppy.XHRUpload, {
	endpoint: '/collections/upload',
	headers:{
		"X-CSRFToken": _csrf
	}
});
