    var Syncano = require('syncano');
    var account = new Syncano({accountKey: 'YOURACCOUNTKEY'});
    var _ = require('lodash');

    var stripe = require("stripe")("sk_test_YOURTESTKEY");

    var userId = ARGS.POST.user_id;
    var stripeId = ARGS.POST.stripe_id;
    var subscriptionId = ARGS.POST.subscription_id;

    stripe.customers.cancelSubscription(
      stripeId,
      subscriptionId,
      function(err, confirmation) {
        var details = {
          "subscribed": false,
          "subscription_id": ""
        };
        
        account.instance('bold-rain-5584').class('user_profile').dataobject(userId).update(details, function(err, res) {
            console.log("User set to unsubscribed");
        });
      }
    );