import React, { Component } from 'react';
import LoginModal from './loginmodal.js';
import gservices from './googleservices.js';
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
    this.state = {
      annotations: [],
    };
  }

  mapResults(results,currentRegion){
    let annotations = results.map(result => {return {rightCalloutView: (<Text>Hehehehe</Text>), title: result.name, image: require('../images/restaurant-71.png'), latitude: result.geometry.location.lat, longitude: result.geometry.location.lng}; });
    

    if (annotations.length > 0){
      this.setState({annotations,currentRegion})
    } else {
      this.setState({currentRegion})

    }
  }

  componentWillMount(){

  }
  render(){
    if (!this.state.auth){
      return <LoginModal />
    }
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
          annotations={this.state.annotations}
          region={this.state.region}
          onRegionChangeComplete={region => {
            console.log('region complete', region);
            if (!this.state.currentRegion){
               gservices.searchNearby(region).then((results) =>  this.mapResults(results,region) );
            } else {
              let distance = gservices.calculateDistance(this.state.currentRegion, region);
              console.log('distance', distance);
              if (distance > 100){
                gservices.searchNearby(region).then((results) =>  this.mapResults(results, region) ) ;
                this.setState({currentRegion:region});
              }
            }
          } }
          style={{flex: 7}}
          followUserLocation={true}
          showsUserLocation={true} />
          <View style={{flex: 1}} >
            <Text>paska</Text>
          </View>


      </View>
        )
  }

  componentDidMount(){
    console.log('map View', this.mapview);
  }
}

