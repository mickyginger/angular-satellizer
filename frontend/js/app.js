angular
  .module('satellizerApp', ['satellizer'])
  .constant('API_URL', 'http://localhost:3000')
  .config(oauthConfig);

oauthConfig.$inject = ['API_URL', '$authProvider', 'facebookClientId', 'twitterClientId'];
function oauthConfig(API_URL, $authProvider, facebookClientId, twitterClientId) {
  $authProvider.facebook({
    url: API_URL + '/auth/facebook',
    clientId: facebookClientId // replace with your facebook client id
  });

  $authProvider.twitter({
    url: API_URL + '/auth/twitter',
    clientId: twitterClientId // replace with your twitter client id
  });
}