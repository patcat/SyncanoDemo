$(document).foundation();

var userKey,
    username,
    userId,
    paid,
    userToken,
    stripeId,
    subscriptionId,
    instance = new Syncano({instance: 'bold-rain-5584', apiKey: '10133b1f19bbd71a11a8055a8357ffd3b233697d'});

(function($) {
  $('#main, #topBar').on('click', '.ajax', function(event) {
    var id = $(this).attr('href').replace('.html', '');
    goToPage(id);

    event.preventDefault();
  });

  function goToPage(page) {
    if (page == 'myaccount') {
      if (username && !paid) {
        $('#main').load(window.location.origin + window.location.pathname + 'payment.html .main-content');
        
        var handler = StripeCheckout.configure({
          key: 'pk_test_v5y17y084K3Di4QzKe7b1hjY',
          locale: 'auto',
          panelLabel: 'Subscribe',
          email: username,
          token: function(token) {
            stripeToken = token;

            $.ajax({
              type: "POST",
              url: "https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/p/1254a339e4544e4c36ae4c5fcf67f4249413b3f2/subscribecustomer/",
              data: {"stripe_token": stripeToken.id, "email": username}
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
              url: "https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/p/cdf26c3725d09b5a4b469a0493295729362d6a32/unsubscribecustomer/",
              data: {"user_id": userId, "stripe_id": stripeId, "subscription_id": subscriptionId}
            })
            .done(function(msg) {
              console.log(JSON.stringify(msg));
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
        $('#main').load(window.location.origin + window.location.pathname + 'settings.html .main-content');
      } else {
        $('#main').load(window.location.origin + window.location.pathname + page+'.html .main-content');
      }
    } else {
      $('#main').load(window.location.origin + window.location.pathname + page+'.html .main-content');
    }
  }

  /* ------------------------------------
   *
   *    User accounts
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

    function callback(resp) {
      $.ajax({
        type: "POST",
        url: "https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/p/f5bb236b40f560a44dbc930a7bebaf87ea18e6d1/savephonenumber/",
        data: {"phone": phone, "user_id": resp.profile.id}
      })
      .done(function(msg) {
        console.log('Phone number saved ', resp);
        userLoggedIn(resp);
      });
    }
    function error(resp) {
      console.log('Register failure... ', resp);
    }

    instance.user().add({"username": username, "password": password})
      .then(callback).catch(error);

    e.preventDefault();
  });

  $('#main').on('submit', '#login', function(e) {
    var $form = $(this),
      username = $('#email').val(),
      password = $('#password').val(),
      data = 'username=' + username + '&password=' + password;

    console.log('Data: ' + data);

    function callback(resp) {
      console.log('Log in success! ', resp);
      userLoggedIn(resp);
    }
    function error(resp) {
      console.log('Log in failure... ', resp);
    }

    instance.user().login({"username": username, "password": password}).then(callback).catch(error);

    e.preventDefault();
  });
}(jQuery));