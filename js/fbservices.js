import {AccessToken} from 'react-native-fbsdk';

export default class FacebookServices {

  static resolveAuth(){
    return AccessToken.getCurrentAccessToken().then(accessToken => {
      this.token = accessToken;
      return accessToken;

    });
  }

  static isLoggedIn(){
    return AccessToken.getCurrentAccessToken().then(data => data !== null);
  }

  static searchNearby(region){
    const NEARBY_URL = 'https://graph.facebook.com/search?q=coffee&center='+region.latitude+','+region.longitude+'&distance=10000&access_token='+this.token.accessToken;
    return fetch(NEARBY_URL).then(data => {
      console.log('data', data);
      return data.json()
    }).then( json => json.results);
    
  }

}
