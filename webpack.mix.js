let mix = require('laravel-mix');

mix.copy('node_modules/bootstrap/dist/js/bootstrap.bundle.js', 'src/third-party/bootstrap/bootstrap.bundle.js');
mix.copy('node_modules/bootstrap/dist/css/bootstrap.css', 'src/third-party/bootstrap/bootstrap.css');
mix.copy('node_modules/bootstrap-icons/font/bootstrap-icons.css', 'src/third-party/bootstrap-icons/bootstrap-icons.css');
mix.copy('node_modules/jquery/dist/jquery.js', 'src/third-party/jquery/jquery.js');

mix.copyDirectory('node_modules/bootstrap-icons/font/fonts', 'src/third-party/bootstrap-icons/fonts');

if (mix.inProduction()) {
	mix.version();
}
