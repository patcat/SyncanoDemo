var Syncano = require('syncano');
var account = new Syncano({accountKey: 'YOURACCOUNTKEY'});

var phone = ARGS.POST.phone;
var userId = ARGS.POST.user_id;

var details = {
  "phone": phone
};

account.instance('bold-rain-5584').class('user_profile').dataobject(userId).update(details, function(err, res) {
  console.log("Phone number " + phone + "added to " + userId + "!");
});