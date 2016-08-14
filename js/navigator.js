import React, { Component } from 'react'; 
import { Navigator, Text, TouchableHighlight, AsyncStorage } from 'react-native';
import TLoc from './components/tloc.js';
import Settings from './components/settings.js';
import NavButton from './components/navbutton.js';
import {watchPosition} from './actions/locationactions';
import fsservices from './actions/fsservices.js';
import fbservices from './actions/fbservices.js';
import gservices from './actions/googleservices.js';

const routes = [{title: 'Nearby places', key: 'main'}, {title: 'Settings', key: 'settings'}];
const storageName = 'TLocSettings';


export default class TLocNavigator extends Component{

  constructor(){
    super();
    this.state = {eating: false, places:[], overlays:[], location: null, annotations:[], fetched: false,type: 'food', radius: 1500};
    this.bind();
  }

  bind(){
    this._onBackClick = this._onBackClick.bind(this);
    this._onRightClick = this._onRightClick.bind(this);
    this.changeValue = this.changeValue.bind(this);    
    this.changeSwitchValue = this.changeSwitchValue.bind(this); 
    this.radiusChanged = this.radiusChanged.bind(this);  
    this.typeChanged = this.typeChanged.bind(this);  

    this.onNewLocation = this.onNewLocation.bind(this);
    this.searchNearbyPlaces = this.searchNearbyPlaces.bind(this); 
 
  }

  onNewLocation(newlocation){
    if (!this.state.location){
      return this.initMap(newlocation);

    }
    let currentRegion = newlocation.coords;
    currentRegion.latitudeDelta = 0.05;
    currentRegion.longitudeDelta = 0.05;
    this.setState({region: currentRegion});
  }

  initMap(newlocation){
    let currentRegion = newlocation.coords;
    currentRegion.latitudeDelta = 0.05;
    currentRegion.longitudeDelta = 0.05;
    this.searchNearbyPlaces(newlocation.coords, this.state.radius, this.state.type).then(places => {
      this.setState({fetched: true, location: currentRegion, annotations: places,region: currentRegion});

    });
  }

  mapResults(results, type){
    let annotations = results.map(result => {
      let self = {
        rightCalloutView: (<Text>Google</Text>), 
        title: result.name,
        gplaceid: result.place_id,
        address: result.vicinity,
        category: result.types[0], 
        image: gservices.getImage(type), 
        latitude: result.geometry.location.lat, 
        longitude: result.geometry.location.lng,
        onFocus: event =>this.onFocus(event, self)  
      }; 
      return self; 
    });
    return annotations;
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


  hasPlacesSeached(){
    if (this.state.annotations.length === 0){
      return false;
    }
    return true;


  }

  isFocused(){
    return this.state.overlays.length > 0 ;
  }

  searchNearbyPlaces(coords, radius,type){
    return Promise.all(
       [//fsservices.searchNearby(radius, coords).then(results => this.mapSquareResults(results)),
        gservices.searchNearby(radius,coords, type).then(results =>  this.mapResults(results,type))
       ]
      ).then(results => {
        let flattenResults = results.reduce( (a,b) => a.concat(b)).sort((a,b) => a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1 );
        return flattenResults;  

       // this.setState({annotations: flattenResults, places: flattenResults});

      });          
  }


  componentWillMount(){
    this.watchID = watchPosition(this.onNewLocation);

    console.log('navigator - will mount');
    let keys = ['type','radius'];
    let promisesArray = keys.map(key => AsyncStorage.getItem(storageName+':'+key) );  

    Promise.all(promisesArray).then(promises => {
      for (let i in keys) {
        let key = keys[i];
        let newState = {};
        newState[key] = this.readValue(promises[i]);
        this.setState(newState);
      }
      return promisesArray;
    }).then(() => console.log('done'));
 
  }

  readValue(val){
    if (!val){
      return null;
    }
    if (!isNaN(val)){
      return parseInt(val, 10);  
    }
    return val;
  }

  readBooleanValue(val){
    console.log('has val', val);
    if (!val || val === '2') {
      return false;
    }
    return true;
  }

  storeBooleanValue(val){
    if (val === true){
      return '1';
    }
    return '2';
  }

  changeValue(property, value){
    let newState = {};
    newState[property] = value;
    this.setState(newState);
  }

  changeSwitchValue(property, value){
    let newState = {};
    newState[property] = value;
    let storageKey = storageName+':'+property;
    this.save(storageKey,this.storeBooleanValue(value), () => this.setState(newState));
  }

  radiusChanged(val){
    this.save(storageName+':radius', val.toString(), () => {
      console.log('radius change complete.');
      this.searchNearbyPlaces(this.state.location,val, this.state.type).then(places => {
        console.log('got places taas', places);
        this.setState({annotations: places});
        //this.setState({fetched: true, annotations: places,region: currentRegion});
      });
    });
  }

  typeChanged(val){
    this.save(storageName+':type', val, () => {
      this.setState({type: val});
      this.searchNearbyPlaces(this.state.location,this.state.radius, val).then(places => {
        console.log('got places taas', places);
        this.setState({annotations: places});
        //this.setState({fetched: true, annotations: places,region: currentRegion});
      });
    });
  }

  save(property, value, cb){
    AsyncStorage.setItem(property, value, cb );

  }

  _onBackClick(){
    this.refs.nav.pop();
  }

  _onRightClick() {
    this.refs.nav.push(routes[1]); 
  }

  _createSettingsNav(){
    const settingsNav = {
      component: Settings,
      title: 'Settings',
      barTintColor: '#996699'
    }
    return settingsNav;
  }

  _createMainScene(){
    return (<TLoc 
                places={this.state.annotations}
                region={this.state.region}
                overlays={this.state.overlays}
                annotations={this.state.annotations}
            />)
  }

  render() {
    if (!this.state.fetched){
      return null;
    }
    return (
      <Navigator
        ref="nav"
        renderScene={(route) => {
          console.log('on render scene...');

          switch(route.__navigatorRouteID){
            case 0:
              return this._createMainScene();
            case 1:
              return (<Settings
                        type={this.state.type}
                        radius={this.state.radius}
                        changeValue={this.changeValue}
                        typeChanged={this.typeChanged}
                        radiusChanged={this.radiusChanged}
                        save={this.save}
                      />)
            default:
              return this._createMainScene();    
          }
        }}
        navigationBar={
          <Navigator.NavigationBar
            style={{backgroundColor: 'white'}}
            routeMapper={{
              LeftButton: (route, navigator, index, navState) =>
              { 
                if (index === 0){
                  return null;
                }
                return (<NavButton onPress={this._onBackClick} label="Back" />); 
              },
              RightButton: (route, navigator, index, navState) => { 
                if (index === 1){
                  return null;
                }
                return (<NavButton onPress={this._onRightClick} label="Settings" />); 
             },
             Title: (route, navigator, index, navState) =>{ 
              return (<Text style={{fontWeight: 'bold'}}>{route.title}</Text>); 
             }
       }}
       
     />
  }
        initialRoute={routes[0]}
        initialRouteStack={routes}
        style={{flex: 1}} />
    );
  }
}

