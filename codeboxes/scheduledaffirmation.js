    var Syncano = require('syncano');
    var _ = require('lodash');
    var account = new Syncano({accountKey: 'YOURACCOUNTKEY'});

    account.instance('bold-rain-5584').class('affirmation').dataobject().list()
    .then(function(res){
      var randomId = _.random(0, res.objects.length - 1),
          messageToSend = res.objects[randomId].affirmation;
        
      console.log('Sending message of ', messageToSend);
        
      var filter = {
        "query": {"subscribed":{"_eq":true}}
      };
        
      account.instance('bold-rain-5584').class('user_profile').dataobject().list(filter, function(err, res) {
        if (err) {
          console.log('Error!');
          console.log(err); return;
        }
        _.each(res.objects, function(user) {
          var payload = {"payload":{'body': messageToSend, 'to_number': user.phone}};
          
          console.log({"body": messageToSend, "to_number": user.phone});

          account.instance('bold-rain-5584').codebox(2).run(payload, function(err, res) {
            console.log('Just sent that SMS out.');
          });
        });
      });
    })
    .catch(function(err) {
      console.log('Error!');
      console.log(err); return;
    });