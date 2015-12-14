# angular-satellizer
A simple implementation of satellizer with angular and an express back-end 

## Setting up the frontend

### Step 1
Add the satellizer script to your `index.html`

```html
<script src="//cdn.jsdelivr.net/satellizer/0.13.1/satellizer.min.js"></script>
```

### Step 2
Inject and configure satellizer

```javascript
// app.js

angular
  .module('YourAppName', ['satellizer'])
  .constant('API_URL', 'http://localhost:3000') // your api url here
  .config(oauthConfig);

oauthConfig.$inject = ['$authProvider'];
function oauthConfig($authProvider) {
  $authProvider.facebook({
    url: API_URL + '/auth/facebook', // the route that will handle the request from facebook
    clientId: // your facebook client id
  });

  $authProvider.twitter({
    url: API_URL + '/auth/twitter', // the route that will handle the request from twitter
    clientId: // your twitter client id
  });
}
```

### Step 3
Add an authenticate method in your controller

```javascript
MainController.$inject = ['$auth'];
function MainController($auth) {
  this.authenticate = function(provider) {
    $auth.authenticate(provider);
  }
}
```

### Step 4
Add 'Sign in with...' buttons to your app

```html
<body ng-controller="MainController as main">
  <button ng-click="main.authenticate('facebook')">Sign in with Facebook</button>
  <button ng-click="main.authenticate('twitter')">Sign in with Twitter</button>
</body>
```

### And your done with the frontend!

## Setting up the backend

Your API will need to handle a `POST` request from each oAuth provider you are attempting to sign in with (Facebook and Twitter in this case). Each provider needs to be handled slightly differently.

Your API will need an HTTP request library and a JWT library. I am using [request-promise](https://github.com/request/request-promise) and [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) respectively.

Check out `api/app.js` for the implementation I used.

For more info checkout the [satellizer documentation](https://github.com/sahat/satellizer)

### Have fun!