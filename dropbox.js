var REDIRECT_URI = 'http://localhost:7700/';
var CLIENT_ID = 'h7bzrn3vyfa3m2r';
var dbx = null
var dbxAuth = new Dropbox.DropboxAuth({
  clientId: CLIENT_ID,
  refreshToken: localStorage.getItem('refresh_token')
});

// if url had code in its params then we prob
// reconnecting so get logged in
//eg. /1.1.1.1/?code=xxxxx
if (hasRedirectedFromAuth()) {
  dbxAuth.setCodeVerifier(sessionStorage.getItem('codeVerifier'));
  dbxAuth.getAccessTokenFromCode(REDIRECT_URI, getCodeFromUrl())
    .then((response) => {
      localStorage.setItem("refresh_token", response.result.refresh_token)
      dbxAuth.setRefreshToken(response.result.refresh_token)
      dbxAuth.setAccessToken(response.result.access_token);
    })
    .catch((error) => {
      console.error(error.error || error);
    });
} else { 
  login() 
}

function loginDropbox() {
  dbxAuth.getAuthenticationUrl(REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true)
    .then(authUrl => {
      localStorage.setItem("codeVerifier", dbxAuth.codeVerifier);
      window.location.href = authUrl;
    })
    .catch((error) => console.error(error));
}


function listFiles() {
      
          var r = dbx.filesListFolder({path: ''})
          renderItems(r)
        }

function login() {
  console.log('login')
  //dbxAuth.setRefreshToken(localStorage.getItem('refresh_token'))
  dbxAuth.refreshAccessToken()
    .then((response) => {
      dbx = new Dropbox.Dropbox({
        auth: dbxAuth
      });
    })
    .catch((error) => {
      console.error(error.error || error);
      loginDropbox()
    })
}


// If the user was just redirected from authenticating, the urls hash will
// contain the access token.
function hasRedirectedFromAuth() {
  return !!getCodeFromUrl();
}

// Parses the url and gets the access token if it is in the urls hash
function getCodeFromUrl() {
  var fromUrl = utils.parseQueryString(window.location.search);
  return fromUrl.code
}
