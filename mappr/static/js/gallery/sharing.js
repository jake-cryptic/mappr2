/*
	Enables the web-sharing API for elements with data-share attributes
*/

let _sharing = {

	init: function () {
		$('[data-share-url]').each(function() {
			let title = $(this).data('share-title') || '';
			let url = $(this).data('share-url') || '';
			if (url.length === 0 || title.length === 0){
				console.warn('Invalid share URL for element', $(this));
			} else {
				$(this).on('click enter', function(){
					let title = $(this).data('share-title') || '';
					let text = $(this).data('share-text') || 'No description';
					let url = $(this).data('share-url') || '';
					_sharing.share(title, text, url)
				});
			}
		});
	},

	getSchema: function(title, text, url){
		return {
  			title: title,
  			text: text,
  			url: url,
		};
	},

	share: function(title, text, url) {
		try {
			navigator.share(
				_sharing.getSchema(title, text, url)
			);
		} catch (err) {
			console.warn('Sharing cancelled');
			console.warn(err);
		}
	}

};

_sharing.init();
