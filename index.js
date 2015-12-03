var express = require('express'),
    app = express(),
    request = require('request'),
    bodyParser = require('body-parser'),
    server = require('http').createServer(app),
    port = process.env.PORT || 8080,
    Syncano = require('./node_modules/syncano/src/syncano');

app.use(bodyParser.urlencoded({extended: true}));

var instance = new Syncano({instance: 'bold-rain-5584', apiKey: '10133b1f19bbd71a11a8055a8357ffd3b233697d'});

app.get('/', function(request, response) {
  response.sendFile(__dirname + '/public/index.html');
});

app.get(/^(.+)$/, function(req, res) {
  res.sendFile(__dirname + '/public/' + req.params[0]);
});

app.post('/register', function(req, res) {
  function callback(resp) {
    res.send(resp);

    var details = {
      "phone": req.body.phone
    };

    var options = {
      url: "https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/savephonenumber/run/",
      headers: {
        "X-API-KEY": "5a15b6d4680dc6c009bc0a05dcc5537c7f263948"
      },
      json: true,
      body: {"phone": req.body.phone, "user_id": resp.profile.id}
    };

    function callback(error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log('Phone number saved');
      }
    }

    request(options, callback);
  }
  function error(resp) {
    console.log('Register failure... ', resp);
  }

  instance.user().add({"username":req.body.username, "password":req.body.password}).then(callback).catch(error);
});

app.post('/login', function(req, res) {
  console.log(req.body);

  function callback(resp) {
    console.log('Log in success! ', resp);
    res.send(resp);
  }
  function error(resp) {
    console.log('Log in failure... ', resp);
  }

  instance.user().login({"username":req.body.username, "password":req.body.password}).then(callback).catch(error);
});

app.post('/subscribe', function(req, res) {
  console.log('Subscribe request received');

  var options = {
    url: "https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/subscribecustomer/run/",
    headers: {
      "X-API-KEY": "5a15b6d4680dc6c009bc0a05dcc5537c7f263948"
    },
    json: true,
    body: {"stripe_token": req.body.stripe_token.id, "email": req.body.email}
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      res.send(body);
    }
  }

  request(options, callback);
});

app.post('/unsubscribe', function(req, res) {
  console.log('Unsubscribe request received');

  var options = {
    url: 'https://api.syncano.io/v1/instances/bold-rain-5584/webhooks/unsubscribecustomer/run/',
    headers: {
      'X-API-KEY': '5a15b6d4680dc6c009bc0a05dcc5537c7f263948'
    },
    json: true,
    body: {"user_id": req.body.user_id, "stripe_id": req.body.stripe_id, "subscription_id": req.body.subscription_id}
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body);
      res.send(body);
    }
  }

  request(options, callback);
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
 
server.listen(port, function() {
  console.log('Listening on ' + port);
});