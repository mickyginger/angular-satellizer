module.exports = {
  port: process.env.PORT || 3000,
  databaseUrl: 'mongodb://localhost/satellizer',
  secret: 'notVerySecret',
  appUrl: 'http://localhost:8000',
  oauth: {
    facebook: {
      accessTokenUrl: 'https://graph.facebook.com/v2.5/oauth/access_token',
      profileUrl: 'https://graph.facebook.com/v2.5/me?fields=id,email,name,picture'
    },
    twitter: {
      requestTokenUrl: 'https://api.twitter.com/oauth/request_token',
      accessTokenUrl: 'https://api.twitter.com/oauth/access_token',
      profileUrl: 'https://api.twitter.com/1.1/users/show.json'
    }
  }
}