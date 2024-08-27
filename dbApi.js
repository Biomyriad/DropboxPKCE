console.log("FILEEE")
class DbApi {

  // if url had code in its params then we prob
  // reconnecting so get logged in
  //eg. /1.1.1.1/?code=xxxxx
  constructor() {
console.log("consttttt")
    this.REDIRECT_URI = 'http://localhost:7700/';
    this.CLIENT_ID = 'h7bzrn3vyfa3m2r';
    this.dbx = null
    this.dbxAuth = new Dropbox.DropboxAuth({
      clientId: this.CLIENT_ID,
      refreshToken: localStorage.getItem('refresh_token'),
      accessToken: localStorage.getItem('access_token')
    });


    if (hasRedirectedFromAuth()) {
      this.dbxAuth.setCodeVerifier(sessionStorage.getItem('codeVerifier'));
      this.dbxAuth.getAccessTokenFromCode(this.REDIRECT_URI, getCodeFromUrl())
        .then((response) => {
          localStorage.setItem("refresh_token", response.result.refresh_token)
          localStorage.setItem("access_token", response.result.access_token)
          this.dbxAuth.setRefreshToken(response.result.refresh_token)
          this.dbxAuth.setAccessToken(response.result.access_token);
        })
        .catch((error) => {
          console.error(error.error || error);
        });
    } else {
      login()
    }
  }

  loginDropbox() {
    this.dbxAuth.getAuthenticationUrl(this.REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true)
      .then(authUrl => {
        localStorage.setItem("codeVerifier", this.dbxAuth.codeVerifier);
        window.location.href = authUrl;
      })
      .catch((error) => console.error(error));
  }


  listFiles() {

    var r = this.dbx.filesListFolder({ path: '' })
    renderItems(r)
  }

  login() {
    this.dbxAuth.refreshAccessToken()
      .then((response) => {
        this.dbx = new Dropbox.Dropbox({
          auth: this.dbxAuth
        });
      })
      .catch((error) => {
        console.error(error.error || error);
        loginDropbox()
      })
  }


  // If the user was just redirected from authenticating, the urls hash will
  // contain the access token.
  hasRedirectedFromAuth() {
    return !!getCodeFromUrl();
  }

  // Parses the url and gets the access token if it is in the urls hash
  getCodeFromUrl() {
    var fromUrl = utils.parseQueryString(window.location.search);
    return fromUrl.code
  }

}

export { DbApi}