import React, { Component } from 'react';
import LoginModal from './loginmodal.js';
import gservices from './googleservices.js';
import fsservices from './fsservices.js';
import fbservices from './fbservices.js';
import {removeHtml} from './util.js';
import InstructionsView from './instructionsview.js';
import PlacesView from './placesview.js';

import PlaceDetailsView from './placedetailsview.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  MapView,
  Navigator,
  TabBarIOS,
  View
} from 'react-native';


export default class TLoc extends Component{

  constructor(){
    super();
    this.mapResults = this.mapResults.bind(this);
    this.mapSquareResults = this.mapSquareResults.bind(this);
    this.onLocationChange = this.onLocationChange.bind(this);
    this.onFocusing = this.onFocusing.bind(this);

    this.onSuccess = this.onSuccess.bind(this);
    this.state = {
      selectedTab: 'eating',
      annotations: [],
      places: [],
      overlays: []
    };
  }
  componentWillReceiveProps(nextProps){
    if (nextProps.radius !== this.props.radius){
      console.log('tloc - receiving new radius');
    }
  }

  mapResults(results){
    let annotations = results.map(result => {
      let self = {
        rightCalloutView: (<Text>Google</Text>), 
        title: result.name,
        gplaceid: result.place_id,
        address: result.vicinity,
        category: result.types[0], 
        image: require('../images/restaurant-71.png'), 
        latitude: result.geometry.location.lat, 
        longitude: result.geometry.location.lng,
        onFocus: event =>this.onFocus(event, self)  
      }; 
      return self; 
    });
    return annotations;
  }

  onFocus(event, place){
    let locobject = {lat: place.latitude, lng: place.longitude};
    this.drawRoute(this.state.location, locobject);
    if (place.gplaceid){
      gservices.fetchDetails(place.gplaceid).then(data => console.log('details', data));
    }
    else if (place.venueid){
      fsservices.fetchDetails(place.venueid).then(data => console.log('vendetails', data));

    }
    this.setState({placesHidden: this.state.places, places: []});


  }

  drawRoute(current, destination){
    gservices.drawRoute(current, destination)
    .then(route => {
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
      let overlays = [
        {coordinates, 
         strokeColor: '#f007',
        lineWidth: 5}
      ];

      let leg = route.legs[0];
      let instructions = removeHtml(leg.steps[0].html_instructions)+' '+leg.steps[0].distance.text;
      let details = { end_location: leg.end_location, address: leg.end_address, distance: leg.distance.value+' m', duration: leg.duration.text};
      let region = gservices.calculateRegion(route.bounds.northeast, route.bounds.southwest);
      this.setState({overlays, details,region, instructions});

    });
  }

  mapSquareResults(results){
    if (!results){
      return [];
    }
    let resultGroups = results.groups[0];
    let mappedResults = resultGroups.items
      .map(item => item.venue)
      .map(venue => {
        let status = '';
        if (venue.hours) {
          status = venue.hours.status;
        }
        let self = {
          venueid: venue.id,
          title: venue.name,
          subtitle: venue.url,
          address: venue.location.address,
          category: venue.categories[0].name,
          image: require('../images/restaurant-71.png'),
          latitude: venue.location.lat,
          longitude: venue.location.lng,
          status,
          onFocus: event =>this.onFocus(event, self)  
        };
        return self;
      });
    return mappedResults; 
    
  }

  componentWillMount(){
    console.log('tloc - componentWillMount');
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

  searchNearbyPlaces(coords){
    Promise.all(
       [fsservices.searchNearby(this.props.radius, coords).then(results => this.mapSquareResults(results)),
        gservices.searchNearby(this.props.radius,coords).then(results =>  this.mapResults(results))
       ]
      ).then(results => {
        let flattenResults = results.reduce( (a,b) => a.concat(b)).sort((a,b) => a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1 );
        this.setState({annotations: flattenResults, places: flattenResults});

      });          
  }

  hasPlacesSeached(){
    if (this.state.annotations.length === 0){
      return false;
    }
    return true;


  }
  onLocationChange(position){
    let coords = position.coords;
    let currentRegion = position.coords;
    if (!this.isFocused()){
      currentRegion.latitudeDelta = 0.05;
      currentRegion.longitudeDelta = 0.05;
    }
    this.setState({region: currentRegion, location: currentRegion})
    if (!this.hasPlacesSeached()){
      this.searchNearbyPlaces(coords);
      return;
    }
    if (this.isFocused()){
      this.drawRoute(currentRegion, this.state.details.end_location);
    }

  }

  isFocused(){
    return this.state.overlays.length > 0 ;
  }

  onFocusing(place, isFocus){
    if (!isFocus){
      let annotations = this.state.allAnnotations;
      this.setState({annotations});
      return;
    }
    let annotations = this.state.annotations;
    let placeFound  = annotations.find( annotation => annotation.title === place.title)
    let newRegion = Object.assign({}, this.state.region, {
      latitude:placeFound.latitude,
      longitude: placeFound.longitude
    });
    let newAnnotations = [placeFound];
    let allAnnotations = annotations.slice();
    this.setState({region: newRegion, annotations: newAnnotations, allAnnotations});
  }

  onRowSelect(place){
    let location = {location: {latitude: place.latitude, longitude: place.longitude} };
    this.onFocus(null, location);

  }


  renderRoot(){
    let places =  this.state.places;

    return (
    
          <View style={{
              flex: 1, 
              paddingTop: 20,
              justifyContent: 'space-between',
              flexDirection: 'column'
            }}>
            
            {this.state.instructions ? <InstructionsView  instructions={this.state.instructions} /> : <View />}
            <MapView
              annotations={this.state.annotations}
              region={this.state.region}
              overlays={this.state.overlays}
              style={{flex: 7}}
              showsUserLocation={true} />
              {this.state.details ? <PlaceDetailsView {...this.state.details} style={{paddingHorizontal: 10}} /> : <View />}

            {places.length > 0 ? <PlacesView style={{flex: 3}} onFocusing={this.onFocusing} onPress={this.onRowSelect}  places={places} /> : <View />}



          </View>
          
        )

  }

  componentWillUnmount(){
    console.log('clearing watch');
    if (this.watchID){
      navigator.geolocation.clearWatch(this.watchID);
    }

  }
}

