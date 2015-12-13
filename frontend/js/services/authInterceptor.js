angular
  .module('satellizerApp')
  .factory('AuthInterceptor', AuthInterceptor);

AuthInterceptor.$inject = ['API_URL', 'TokenService'];
function AuthInterceptor(API_URL, TokenService) {
  return {

    request: function(config) {
      var token = TokenService.getToken();

      if(config.url.match(API_URL) && token) {
        config.headers.Authorization = 'Bearer ' + token;
      }

      return config;
    },

    response: function(res) {
      if(res.config.url.match(API_URL) && res.data.token) {
        TokenService.saveToken(res.data.token);
      }

      return res;
    }
  }
}