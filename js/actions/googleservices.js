

import {RADIUS, doSearch} from './searchservice.js';
const API_KEY = 'AIzaSyCqQggXW96VN1ndIQKwq47tewKkvb2w4ZI';
const TYPE_OBJ = {'post_office': require('../../images/post_office-71.png'), 
                  'food': require('../../images/restaurant-71.png')
                };
class GoogleServices {
  static searchNearby(radius,region, type){
    const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius='+radius+'&language=en&type='+type+'&location='+region.latitude+','+region.longitude+'&key='+API_KEY
    return doSearch(NEARBY_URL).then( json => json.results);
  }

  static calculateDistance(region1, region2){
    var R = 6371; // Radius of the earth in km
    let [lat1, lat2, lon1, lon2] = [region1.latitude, region2.latitude, region1.longitude, region2.longitude];
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
    return (12742 * Math.asin(Math.sqrt(a))) * 1000;

  }

  static getImage(type){
    return TYPE_OBJ[type];
  }

  static drawRoute(currentRegion, location){
    return doSearch('https://maps.googleapis.com/maps/api/directions/json?origin='+currentRegion.latitude+','+currentRegion.longitude+'&mode=walking&destination='+location.lat+','+location.lng+'&key='+API_KEY)
      .then(data => data.routes[0]);
  }

  static fetchDetails(placeid){
    return doSearch('https://maps.googleapis.com/maps/api/place/details/json?placeid='+placeid+'&key='+API_KEY)
            .then(data => data.result);
  }



  static calculateRegion(northeast, southwest){
    const LISAKERROIN = 0.001;
    let latitude = (northeast.lat + southwest.lat) / 2;
    let longitude = (northeast.lng + southwest.lng) / 2;
    let latitudeDelta = Math.abs(northeast.lat - southwest.lat) +  LISAKERROIN;
    let longitudeDelta = Math.abs(northeast.lng - southwest.lng) + LISAKERROIN;
    return {
      latitude,
      longitude,
      latitudeDelta,
      longitudeDelta
    };

  }

}

export default GoogleServices;