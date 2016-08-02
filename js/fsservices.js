
import {RADIUS, doSearch} from './searchservice.js';
const CLIENT_ID = 'R3PSU1V0A45ZZ4ZCDHGB4LOYCEJPG4QVBTDSG4HRBBACOMA4';
const CLIENT_SECRET = 'YPALXFCF1RZPI5JZZ0MVF2TVMQ4QTHDHQEMKSM3FROARZJRL';
const VERSION = '20131017'; 
export default class FourSquareServices{

  static searchNearby(region){
    const URL = `https://api.foursquare.com/v2/venues/explore?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&section=food&ll=${region.latitude},${region.longitude}&v=${VERSION}&radius=${RADIUS}`;
    return doSearch(URL).then(json => json.response);
  }

  static fetchDetails(venueid){
    return doSearch('https://api.foursquare.com/v2/venues/'+venueid+'?client_id='+CLIENT_ID+'&client_secret='+CLIENT_SECRET+'&v='+VERSION)
      .then(data => data.response);
  }

};