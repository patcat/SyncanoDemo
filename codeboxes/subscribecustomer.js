var Syncano = require('syncano');
var account = new Syncano({accountKey: 'YOURACCOUNTKEY'});
var _ = require('lodash');

var stripe = require("stripe")("sk_test_YOURTESTKEY");
var stripeToken = ARGS.POST.stripe_token;
var email = ARGS.POST.email;

stripe.customers.create({
  source: stripeToken,
  plan: "affirmationsubscription",
  email: email
}, function(err, customer) {
  account.instance('bold-rain-5584').user().list()
  .then(function(res){
      console.log(res);
      
      _.each(res.objects, function(user) {
          if (user.username == email) {
              console.log("USER:");
              console.log(user);
              
              var details = {
                "subscribed": true,
                "stripe_id": customer.id,
                "subscription_id": customer.subscriptions.data[0].id
              };
              
              account.instance('bold-rain-5584').class('user_profile').dataobject(user.profile.id).update(details, function(err, res) {
                  console.log(customer.id + ',' + customer.subscriptions.data[0].id);
              });
          }
      });
  })
  .catch(function(err) {
      console.log("Error! ", err);
  });
});