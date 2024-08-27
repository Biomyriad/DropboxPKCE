class DbApi {

  // if url had code in its params then we prob
  // reconnecting so get logged in
  //eg. /1.1.1.1/?code=xxxxx
  constructor() {
    console.log("cont")
    this.REDIRECT_URI = 'http://localhost:5500/';
    this.CLIENT_ID = 'h7bzrn3vyfa3m2r';
    this.dbx = null
    this.dbxAuth = new Dropbox.DropboxAuth({
      clientId: 'h7bzrn3vyfa3m2r',
      refreshToken: localStorage.getItem('db_refresh_token'),
      accessToken: localStorage.getItem('db_access_token'),
      accessTokenExpiresAt: localStorage.getItem("db_expires_at")
    });

    if (this.hasRedirectedFromAuth()) {
      this.dbxAuth.setCodeVerifier(sessionStorage.getItem('codeVerifier'));
      this.dbxAuth.getAccessTokenFromCode(this.REDIRECT_URI, this.getCodeFromUrl())
        .then((response) => {
          console.log(response)
          localStorage.setItem("db_refresh_token", response.result.refresh_token)
          localStorage.setItem("db_access_token", response.result.access_token)
          this.dbxAuth.setRefreshToken(response.result.refresh_token)
          this.dbxAuth.setAccessToken(response.result.access_token);
          window.location.href = this.REDIRECT_URI
        })
        .catch((error) => {
          console.error(error.error || error);
        });
    } else {
      this.login()
    }
  }

  listFiles() { // EXAMPLE
    var r = dbx.dbx.filesListFolder({path: ''}) // returns promise
    r.then( text => {renderItems(text.result.entries); console.log(text.result.entries)})
    .catch(e => console.log(e))
  }

  loginDropbox() {
    this.dbxAuth.getAuthenticationUrl(this.REDIRECT_URI, undefined, 'code', 'offline', undefined, undefined, true)
      .then(authUrl => {
        sessionStorage.setItem("codeVerifier", this.dbxAuth.codeVerifier);
        window.location.href = authUrl;
      })
      .catch((error) => console.error(error));
  }

  login() {
    this.dbxAuth.refreshAccessToken()
      .then((response) => {

        this.dbx = new Dropbox.Dropbox({
          auth: this.dbxAuth
        })
        
        if(this.dbx.auth.accessToken !== null) localStorage.setItem("db_access_token", this.dbx.auth.accessToken)
        if(this.dbx.auth.refreshToken !== localStorage.getItem('db_refresh_token')) {
          localStorage.setItem("db_refresh_token", this.dbx.auth.refreshToken)
          console.log("NEW RefreshToken!")
        }
        
      })
      .catch((error) => {
        console.error(error.error || error);
        this.loginDropbox()
      })
  }


  // If the user was just redirected from authenticating, the urls hash will
  // contain the access token.
  hasRedirectedFromAuth() {
    return !!this.getCodeFromUrl();
  }

  // Parses the url and gets the access token if it is in the urls hash
  getCodeFromUrl() {
    var fromUrl = utils.parseQueryString(window.location.search);
    return fromUrl.code
  }

}

(function (window) {
  window.utils = {
    parseQueryString(str) {
      const ret = Object.create(null);

      if (typeof str !== 'string') {
        return ret;
      }

      str = str.trim().replace(/^(\?|#|&)/, '');

      if (!str) {
        return ret;
      }

      str.split('&').forEach((param) => {
        const parts = param.replace(/\+/g, ' ').split('=');
        // Firefox (pre 40) decodes `%3D` to `=`
        // https://github.com/sindresorhus/query-string/pull/37
        let key = parts.shift();
        let val = parts.length > 0 ? parts.join('=') : undefined;

        key = decodeURIComponent(key);

        // missing `=` should be `null`:
        // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
        val = val === undefined ? null : decodeURIComponent(val);

        if (ret[key] === undefined) {
          ret[key] = val;
        } else if (Array.isArray(ret[key])) {
          ret[key].push(val);
        } else {
          ret[key] = [ret[key], val];
        }
      });

      return ret;
    },
  };
}(window));