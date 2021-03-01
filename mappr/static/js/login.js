$('#create-submit').on('click enter', function(evt){
	evt.preventDefault();
	$('#create-submit').prop('disabled', true).text('Please wait...');
	$('#create_form').submit();
});

$('#login-submit').on('click enter', function(evt){
	evt.preventDefault();
	$('#login-submit').prop('disabled', true).text('Logging in...');
	$('#login_form').submit();
});
