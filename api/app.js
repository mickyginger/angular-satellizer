var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cors = require('cors');
var jwt = require('jsonwebtoken');
// request is used to make requests to external servers like facebook and twitter's APIs
var request = require('request-promise');
// qs is used to decode querystrings into objects foo=1&bar=2 becomes { foo: 1, bar: 2 }
var qs = require('qs');
var app = express();

var config = require('./config');

var User = require('./models/user');

mongoose.connect(config.databaseUrl);

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({
  origin: config.appUrl,
  credentials: true
}));

// After the user logs in with facebook, facebook's server will send a request to this endpoint
// with a code and a client id, which we will use to get an access token
app.post('/auth/facebook', function(req, res) {
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: process.env.FACEBOOK_API_SECRET,
    redirect_uri: config.appUrl + "/"
  };

  // step 1, we make a request to facebook for an access token
  request.get({ url: config.oauth.facebook.accessTokenUrl, qs: params, json: true })
    .then(function(accessToken) {
      // step 2, we use the access token to get the user's profile data from facebook's api
      return request.get({ url: config.oauth.facebook.profileUrl, qs: accessToken, json: true });
    })
    .then(function(profile) {
      // step 3, we try to find a user in our database by their email
      return User.findOne({ email: profile.email })
        .then(function(user) {
          // if we find the user, we set their facebookId and picture to their profile data
          if(user) {
            user.facebookId = profile.id;
            user.picture = user.picture || profile.picture.data.url;
          }
          else {
            // otherwise, we create a new user record with the user's profile data from facebook
            user = new User({
              facebookId: profile.id,
              name: profile.name,
              picture: profile.picture.data.url,
              email: profile.email
            });
          }
          // either way, we save the user record
          return user.save();
        })
      })
      .then(function(user) {
        // step 4, we create a JWT and send it back to our angular app
        var token = jwt.sign(user, config.secret, { expiresIn: '24h' });
        return res.send({ token: token });
      })
      .catch(function(err) {
        // we handle any errors here
        return res.status(500).json({ error: err });
      });
});

// After the user logs in with twitter, twitter will send a request to this endpoint
app.post('/auth/twitter', function(req, res) {
  if (!req.body.oauth_token || !req.body.oauth_verifier) {
    var params = {
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      callback: req.body.redirectUri
    };

    // step 1, we send our APIs credentials to twitter, to get a request token
    // twitter will then send a second request to this endpoint with a token and verifier
    request.post({ url: config.oauth.twitter.requestTokenUrl, oauth: params })
      .then(function(body) {
        var oauthToken = qs.parse(body);
        return res.send(oauthToken);
      })
      .catch(function(err) {
        return res.status(500).json({ error: err });
      });
  } else {
    var params = {
      oauth_token: req.body.oauth_token,
      oauth_verifier: req.body.oauth_verifier
    };

    // step 2, when the second arrives with the token and verifier
    // we can make a request for an access token
    request.post({ url: config.oauth.twitter.accessTokenUrl, form: params })
      .then(function(token) {
        var token = qs.parse(token);
        var params = {
          consumer_key: process.env.TWITTER_CONSUMER_KEY,
          consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
          oauth_token: token.oauth_token
        };

        // step 3, we use the access token to get the user's profile data
        return request.get({ url: config.oauth.twitter.profileUrl+'?screen_name=' + token.screen_name, oauth: params, json: true });
      })
      .then(function(profile) {
        // step 4, we cannot get the user's email address from twitter, so we have to search for a user
        // by their twitter id
        return User.findOne({ twitterId: profile.id })
          .then(function(user) {
            // if we find a user in our database, we set their twitter id, and set their picture
            if(user) {
              user.twitterId = profile.id;
              user.picture = user.picture || profile.profile_image_url.replace('_normal', '');
            }
            else {
              // otherwise, we create a new user record, using their profile data
              var user = new User({
                name: profile.name,
                twitterId: profile.id,
                picture: profile.profile_image_url.replace('_normal', '')
              });
            }
            // either way, we save the user record
            return user.save();
          })
        })
        .then(function(user) {
          // step 5, we create a JWT and send it back to our angular app
          var token = jwt.sign(user, config.secret, { expiresIn: '24h' });
          return res.status(200).json({ token: token });
        })
        .catch(function(err) {
          // we handle any errors here
          return res.status(500).json({ error: err });
        });
  }
});

app.listen(config.port);
console.log("Express is listening on port " + config.port);