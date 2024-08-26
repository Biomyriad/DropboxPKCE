var REDIRECT_URI = 'http://localhost:7700/';
var CLIENT_ID = 'h7bzrn3vyfa3m2r';
var dbxAuth = new Dropbox.DropboxAuth({
  clientId: CLIENT_ID,
});

// Parses the url and gets the access token if it is in the urls hash
function getCodeFromUrl() {
  var fromUrl = utils.parseQueryString(window.location.search);
  return fromUrl.code
}

// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
function hasRedirectedFromAuth() {
  return !!getCodeFromUrl();
}

function doAuth() {
  dbxAuth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true)
    .then(authUrl => {
      window.sessionStorage.clear();
      window.sessionStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
      console.log(authUrl)
      //window.location.href = authUrl;
    })
    .catch((error) => console.error(error));
};

if (hasRedirectedFromAuth()) {
  dbxAuth.setCodeVerifier(window.sessionStorage.getItem('codeVerifier'));
  dbxAuth.getAccessTokenFromCode(REDIRECT_URI, getCodeFromUrl())
    .then((response) => {
      console.log(response)
      dbxAuth.setRefreshToken(response.result.refresh_token);
      dbxAuth.setAccessToken(response.result.access_token);
      var dbx = new Dropbox.Dropbox({
        auth: dbxAuth
      });
      return dbx.filesListFolder({
        path: ''
      });
    })
    .then((response) => {
      renderItems(response.result.entries);
    })
    .catch((error) => {
      console.error(error.error || error);
    });
} else {
  showPageSection('pre-auth-section');
}