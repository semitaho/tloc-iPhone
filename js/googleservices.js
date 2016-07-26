
const API_KEY = 'AIzaSyCqQggXW96VN1ndIQKwq47tewKkvb2w4ZI';
class GoogleServices {
  static searchNearby(region){
    const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?radius=1500&type=restaurant&location='+region.latitude+','+region.longitude+'&key='+API_KEY
    console.log('doing query',NEARBY_URL);

    return fetch(NEARBY_URL).then(data => data.json())
      .then( json => json.results);
  }

  static calculateDistance(region1, region2){
    var R = 6371; // Radius of the earth in km
    let [lat1, lat2, lon1, lon2] = [region1.latitude, region2.latitude, region1.longitude, region2.longitude];
    console.log('lat1', lat1);
        console.log('lat2', lat2);

    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;
    return (12742 * Math.asin(Math.sqrt(a))) * 1000;

  }

}

export default GoogleServices;