let mix = require('laravel-mix');

mix.disableNotifications();

// Bootstrap 5
mix.copy('node_modules/bootstrap/dist/js/bootstrap.min.js', 'mappr/static/third-party/bootstrap/bootstrap.min.js');
mix.copy('node_modules/bootstrap/dist/js/bootstrap.min.js.map', 'mappr/static/third-party/bootstrap/bootstrap.min.js.map');
mix.copy('node_modules/bootstrap/dist/css/bootstrap.min.css', 'mappr/static/third-party/bootstrap/bootstrap.min.css');
mix.copy('node_modules/bootstrap/dist/css/bootstrap.min.css.map', 'mappr/static/third-party/bootstrap/bootstrap.min.css.map');

// Leaflet.beautifymarker
mix.copy('node_modules/beautifymarker/leaflet-beautify-marker-icon.js', 'mappr/static/third-party/beautifymarker/leaflet-beautify-marker-icon.js');
mix.copy('node_modules/beautifymarker/leaflet-beautify-marker-icon.css', 'mappr/static/third-party/beautifymarker/leaflet-beautify-marker-icon.css');

// jQuery
mix.copy('node_modules/jquery/dist/jquery.min.js', 'mappr/static/third-party/jquery/jquery.min.js');

// mix.copyDirectory('node_modules/bootstrap-icons/font/fonts', 'src/third-party/bootstrap-icons/fonts');

if (mix.inProduction()) {
	mix.version();
}
