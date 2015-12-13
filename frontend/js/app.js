angular
  .module('satellizerApp', ['satellizer'])
  .config(oauthConfig);

oauthConfig.$inject = ['$authProvider', 'facebookClientId', 'twitterClientId'];
function oauthConfig($authProvider, facebookClientId, twitterClientId) {
  $authProvider.facebook({
    url: 'http://localhost:3000/auth/facebook',
    clientId: facebookClientId // replace with your facebook client id
  });

  $authProvider.twitter({
    url: 'http://localhost:3000/auth/twitter',
    clientId: twitterClientId // replace with your twitter client id
  });
}