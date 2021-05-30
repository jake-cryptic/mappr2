/*
	Enables the web-sharing API for elements with data-share attributes
*/

let _sharing = {

	init: function () {
		if ('share' in navigator) {
			_sharing.assignShareEvents();
		} else {
			$('[data-share-url]').each(function() {
				$(this).removeClass('btn-primary').addClass('btn-secondary').on('click enter', function(){
					alert('This feature is not available in your browser');
				});
			});
		}
	},

	assignShareEvents: function () {
		$('[data-share-url]').each(function() {
			let title = $(this).data('share-title') || '';
			let url = $(this).data('share-url') || '';
			if (url.length === 0 || title.length === 0){
				console.warn('Invalid share URL for element', $(this));
			} else {
				$(this).on('click enter', function(){
					$el = $(this);
					let title = $el.data('share-title') || '';
					let text = $el.data('share-text') || 'No description';
					let url = $el.data('share-url') || '';
					_sharing.share($el, title, text, url)
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

	share: function($el, title, text, url) {
		$el.html('<i class="fas fa-spinner"></i> Sharing...');
		try {
			navigator.share(
				_sharing.getSchema(title, text, url)
			);
			$el.html('<i class="fas fa-check-circle"></i> Shared');
		} catch (err) {
			$el.html('<i class="fas fa-times-circle"></i> Failed');
			console.warn('Sharing cancelled');
			console.warn(err);
		}
	}

};

_sharing.init();
