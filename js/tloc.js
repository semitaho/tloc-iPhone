import React, { Component } from 'react';
import LoginModal from './loginmodal.js';
import gservices from './googleservices.js';
import fsservices from './fsservices.js';
import fbservices from './fbservices.js';
import PlaceDetailsView from './placedetailsview.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  MapView,
  View
} from 'react-native';


export default class TLoc extends Component{

  constructor(){
    super();
    this.mapResults = this.mapResults.bind(this);
    this.mapSquareResults = this.mapSquareResults.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);

    this.onSuccess = this.onSuccess.bind(this);
    this.state = {
      annotationsGoogle: [],
      annotationsFs: [],
      overlays: []
    };
  }

  mapResults(results,currentRegion){
    let annotations = results.map(result => {
      return {
        rightCalloutView: (<Text>Google</Text>), 
        title: result.name, 
        image: require('../images/restaurant-71.png'), 
        latitude: result.geometry.location.lat, 
        longitude: result.geometry.location.lng
      }; 
    });
    if (annotations.length > 0){
      this.setState({annotationsGoogle:annotations,currentRegion})
    } else {
      this.setState({currentRegion})

    }
  }

  onFocus(event, location){
    gservices.drawRoute(this.state.currentRegion, location.location)
    .then(route => {
      console.log('route', route);
      let coordinates = route.legs[0].steps.map(step => {
        return {
          latitude: step.start_location.lat,
          longitude: step.start_location.lng,
        };
      })
      let lastStep = route.legs[0].steps[route.legs[0].steps.length-1];
      let lastCoordinate = {
        latitude: lastStep.end_location.lat, 
        longitude: lastStep.end_location.lng 
      };
      coordinates.push(lastCoordinate);
      console.log('coords', coordinates);
      let overlays = [
        {coordinates, 
         strokeColor: '#f007',
        lineWidth: 6}
      ];

      let leg = route.legs[0];
      let details = {address: leg.end_address, distance: leg.distance.text, duration: leg.duration.text};
      let region = gservices.calculateRegion(route.bounds.northeast, route.bounds.southwest);
      this.setState({overlays, details,region});

    });
  }

  mapSquareResults(results){
    if (!results){
      return;
    }
    let resultGroups = results.groups[0];
    let mappedResults = resultGroups.items
      .map(item => item.venue)
      .map(venue => {
        return {
          title: venue.name,
          image: require('../images/restaurant-71.png'),
          latitude: venue.location.lat,
          longitude: venue.location.lng,
          onFocus: event =>this.onFocus(event, {location: venue.location})  
        };
      }); 

      this.setState({annotationsFs:mappedResults})

  }

  componentWillMount(){
    this.watchID = navigator.geolocation.watchPosition(this.onLocationChange);
    fbservices.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn){
        return fbservices.resolveAuth();
      } 
    }).then(done => {
      if (done){
        this.setState({auth: done});
      }
    });

  }

  onSuccess(auth){
    fbservices.resolveAuth().then(auth => this.setState({auth}));
    this.setState({auth});
  }

  render(){

    if (this.state.auth){
      return this.renderRoot();
    } else {
      return <LoginModal onSuccess={this.onSuccess} />
    }

  }
  onLocationChange(position){
    console.log('location change', position);
    let coords = position.coords;
    if (!this.state.currentLocation){
      fsservices.searchNearby(coords).then(results => this.mapSquareResults(results));
      gservices.searchNearby(coords).then((results) =>  this.mapResults(results,coords) );           
    }
  }

  renderRoot(){
    let annotations = this.state.annotationsFs.concat(this.state.annotationsGoogle);
    return (
      <View style={{
          flex: 1, 
          paddingTop: 20,
          justifyContent: 'space-between',
          flexDirection: 'column'
        }}>
        <View style={{alignItems: 'center'}}>
          <Text style={{fontSize: 25}}>Go to eat</Text>
        </View>
        <MapView
          title="plaaah"
          refs={(ref) => this.mapview = ref }
          annotations={annotations}
          region={this.state.region}
          overlays={this.state.overlays}
          onRegionChangeComplete={region => {
            /*
            if (!this.state.currentRegion){
            } else {
              let distance = gservices.calculateDistance(this.state.currentRegion, region);
              if (distance > 100){
                fsservices.searchNearby(region).then(results => this.mapSquareResults(results));
                gservices.searchNearby(region).then((results) =>  this.mapResults(results, region) ) ;
                this.setState({currentRegion:region});
              }
            }
            */
          } }
          style={{flex: 7}}
          followUserLocation={true}
          showsUserLocation={true} />
          {this.state.details ? <PlaceDetailsView {...this.state.details} style={{paddingHorizontal: 10}} /> : <View />}


      </View>
        )

  }

  componentDidMount(){

  }
}

