angular
  .module('satellizerApp', ['satellizer'])
  .config(oauthConfig);

oauthConfig.$inject = ['$authProvider', 'configService'];
function oauthConfig($authProvider, configService) {
  $authProvider.facebook({
    clientId: config.facebookClientId // replace with your facebook client id
  });

  $authProvider.twitter({
    clientId: config.twitterClientId // replace with your twitter client id
  });
}