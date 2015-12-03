$(document).foundation();

var userKey,
  	username,
  	userId,
  	paid,
  	userToken,
  	stripeId,
  	subscriptionId;

(function($) {
	$('#main, #topBar').on('click', '.ajax', function(event) {
		var id = $(this).attr('href').replace('.html', '');
		goToPage(id);

		event.preventDefault();
	});

	function goToPage(page) {
		if (page == 'myaccount') {
			if (username && !paid) {
				$('#main').load('/payment.html .main-content');
				
        var handler = StripeCheckout.configure({
			    key: 'pk_test_v5y17y084K3Di4QzKe7b1hjY',
			    locale: 'auto',
			    panelLabel: 'Subscribe',
			    email: username,
			    token: function(token) {
			    	stripeToken = token;

						$.ajax({
							type: "POST",
							url: "/subscribe",
							data: {"stripe_token": stripeToken, "email": username}
						})
						.done(function(msg) {
							paid = true;
							ids = msg.result.stdout.split(',');
							stripeId = ids[0];
							subscriptionId = ids[1];

							goToPage('myaccount');
						});
			    }
			  });

			  $('#main').on('click', '#paymentButton', function(e) {
			    handler.open({
			      name: "Life is Good Affirmations",
			      description: "A monthly subscription to daily affirmations!",
			      currency: "aud"
			    });
			    e.preventDefault();
			  });

			  $(window).on('popstate', function() {
			    handler.close();
			  });
			} else if (username && paid) {
				$('#main').on('click', '#unsubscribeButton', function(e) {
				    $.ajax({
						type: "POST",
						url: "/unsubscribe",
						data: {"user_id": userId, "stripe_id": stripeId, "subscription_id": subscriptionId}
					})
					.done(function(msg) {
						paid = false;
						subscriptionId = '';
						goToPage('myaccount');
					});

				  e.preventDefault();
				});
				$('#main').on('click', '#logoutButton', function(e) {
					logoutUser();

				  e.preventDefault();
				});
				$('#main').load('/settings.html .main-content');
			} else {
				$('#main').load('/'+page+'.html .main-content');
			}
		} else {
			$('#main').load('/'+page+'.html .main-content');
		}
	}

	/* ------------------------------------
	 *
	 * 		User accounts
	 *
	 * ------------------------------------ */
	function userLoggedIn(resp) {
		userKey = resp.user_key;
		username = resp.username;
		userId = resp.profile.id;
		stripeId = resp.profile.stripe_id;
		subscriptionId = resp.profile.subscription_id;
		paid = resp.profile.subscribed;

		goToPage('myaccount');
	}
	function logoutUser() {
		userKey = '';
		username = '';
		userId = '';
		paid = '';
		userToken = '';
		stripeId = '';
		subscriptionId = '';

		goToPage('index');
	}
	$('#main').on('submit', '#register', function(e) {
		var $form = $(this),
  			username = $('#email').val(),
  			password = $('#password').val(),
  			phone = $('#phone').val(),
  			data = 'username=' + username + '&password=' + password + '&phone=' + phone;

		$.ajax({
			type: 'POST',
			url: '/register',
			data: data
		})
		.done(function(msg) {
			userLoggedIn(msg);
		});

		e.preventDefault();
	});

	$('#main').on('submit', '#login', function(e) {
		var $form = $(this),
			username = $('#email').val(),
			password = $('#password').val(),
			data = 'username=' + username + '&password=' + password;

		console.log('Data: ' + data);
		$.ajax({
			type: "POST",
			url: "/login",
			data: data
		})
		.done(function(msg) {
			userLoggedIn(msg);
		});

		e.preventDefault();
	});
}(jQuery));