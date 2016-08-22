import React, { Component } from 'react';
import LoginModal from './loginmodal.js';
import gservices from '../actions/googleservices.js';
import fsservices from '../actions/fsservices.js';
import fbservices from '../actions/fbservices.js';
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
    this.onSuccess = this.onSuccess.bind(this);
    this.state = {
      selectedTab: 'eating',
      annotations: [],
      places: []
    };
  }
  componentWillReceiveProps(nextProps){
    
  }


  componentWillMount(){
    console.log('tloc - componentWillMount');
    /*
    fbservices.isLoggedIn().then(isLoggedIn => {
      if (isLoggedIn){
        return fbservices.resolveAuth();
      } 
    }).then(done => {
      if (done){
        this.setState({auth: done});
      }
    });
    */

  }

  onSuccess(auth){
    fbservices.resolveAuth().then(auth => this.setState({auth}));
    this.setState({auth});
  }

  render(){
    return this.renderRoot();
    /*

    if (this.state.auth){
    } else {
      return <LoginModal onSuccess={this.onSuccess} />
    }
    */
  }

 
  onLocationChange(position){
    /*
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
    */

  }

  renderRoot(){
    let places =  this.props.places; 
    return (
          <View style={{
              flex: 5,
              marginTop: 50,
              flex: 1,
              justifyContent: 'space-between',
              flexDirection: 'column'
            }}>
            
            {this.props.instructions ? <InstructionsView  instructions={this.props.instructions} onCancel={event => this.props.onFocusing(null, false) } /> : null}
            
            <MapView
              annotations={this.props.annotations}
              region={this.props.region}
              overlays={this.props.overlays}
              style={{flex: 7}}
              showsUserLocation={true} />
              {this.props.details ? <PlaceDetailsView {...this.props.details} style={{paddingHorizontal: 10}} /> : <View />}

            {places.length > 0 ? <PlacesView style={{flex: 3}} onFocusing={this.props.onFocusing} onPress={this.props.onRowSelect}  places={places} /> : <View />}


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

