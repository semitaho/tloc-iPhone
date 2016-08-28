import React, { Component } from 'react'; 
import { Navigator, Text, TouchableHighlight, AsyncStorage } from 'react-native';
import TLoc from './components/tloc.js';
import Settings from './components/settings.js';
import NavButton from './components/navbutton.js';
import {watchPosition} from './actions/locationactions';
import fsservices from './actions/fsservices.js';
import fbservices from './actions/fbservices.js';
import gservices from './actions/googleservices.js';
import {removeHtml, mapToFlatCoordinates} from './util.js';
import polyline from 'polyline';
const routes = [{title: 'Nearby places', key: 'main'}, {title: 'Settings', key: 'settings'}];
const storageName = 'TLocSettings';
const R_EARTH = 6378;
const LISAKERROIN = 0.001;

export default class TLocNavigator extends Component{

  constructor(){
    super();
    this.state = {eating: false, overlays:[], location: null, locationCurrent: null, annotations:[], fetched: false,type: 'food', radius: 1500};
    this.bind();
  }

  bind(){
    this._onBackClick = this._onBackClick.bind(this);
    this._onRightClick = this._onRightClick.bind(this);
    this.changeValue = this.changeValue.bind(this);    
    this.changeSwitchValue = this.changeSwitchValue.bind(this); 
    this.radiusChanged = this.radiusChanged.bind(this);  
    this.valueChanged = this.valueChanged.bind(this);  
    this._onFocusing = this._onFocusing.bind(this);
    this.onNewLocation = this.onNewLocation.bind(this);
    this.searchNearbyPlaces = this.searchNearbyPlaces.bind(this); 
    this.onRowSelect = this.onRowSelect.bind(this);
    this.onBlur = this.onBlur.bind(this);
 
  }

  onNewLocation(newlocation){
    if (this.state.location === null){
      return this.initMap(newlocation);
    }
    let currentRegion = newlocation.coords;
    this.fillDefaultDelta(currentRegion);
    this.setState({region: currentRegion, locationCurrent: currentRegion});
  }

  fillDefaultDelta(currentRegion){
    currentRegion.latitudeDelta = this.calculateNewLatitude();
    currentRegion.longitudeDelta = this.calculateNewLongitude(currentRegion.latitude);
  }

  calculateNewLatitude(){
    const LISAKERROIN = 0.001;

    let newVal =  ((this.state.radius / 1000) / R_EARTH * (180 / Math.PI) ) + LISAKERROIN;
    console.log('new val', newVal);
    return newVal;
  }

  calculateNewLongitude(latitude){
    const LISAKERROIN = 0.001;
    let latitudeDelta =  ((this.state.radius / 1000) / R_EARTH * (180 / Math.PI) / Math.cos(latitude * Math.PI/180) ) + LISAKERROIN;
    return latitudeDelta;

  }

  loadSettings(){

  }

  initMap(newlocation){
    let currentRegion = newlocation.coords;
    this.fillDefaultDelta(currentRegion);
    this.searchNearbyPlaces(newlocation.coords, this.state.radius, this.state.type).then(places => {
      let keys = ['type', 'mapType','radius'];
      let promisesArray = keys.map(key => AsyncStorage.getItem(storageName+':'+key) );  
      return Promise.all(promisesArray).then(promises => {
        let newState = {};
        for (let i in keys) {
          let key = keys[i];
          newState[key] = this.readValue(promises[i]);
        }
        console.log('nestate', newState);
        newState.annotations = places;
        newState.annotationsAll= places;
        newState.region = currentRegion;
        newState.fetched = true;
        newState.locationCurrent = currentRegion;
        newState.location = currentRegion;
        return newState;
      });
    }).then((state) => {
      this.setState(state);
    });
  }

  mapResults(results, type){
    let annotations = results.map(result => {
      let status = '';
      if (result.opening_hours){
        if (result.opening_hours.open_now){
          status='Open';
        } else {
          status='Closed';
        }
      }

      let self = {
        rightCalloutView: (<Text>Google</Text>), 
        title: result.name,
        gplaceid: result.place_id,
        address: result.vicinity,
        category: result.types[0], 
        image: gservices.getImage(type), 
        status, 
        latitude: result.geometry.location.lat, 
        longitude: result.geometry.location.lng,
        onBlur: event => this.onBlur(event, self),
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
      this.searchNearbyPlaces(this.state.location,val, this.state.type).then(places => {
        this.setState({annotations: places});
        //this.setState({fetched: true, annotations: places,region: currentRegion});
      });
    });
  }

  valueChanged(type,val){
    this.save(storageName+':'+type, val, () => {
      let stateNew = {};
      stateNew[type] = val;

      this.setState(stateNew);
      this.searchNearbyPlaces(this.state.location,this.state.radius, val).then(places => {
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

  _onFocusing(place, isFocus){
    if (!isFocus){
      let annotations = this.state.annotationsAll.slice();
      let region = this.state.locationCurrent;
      this.setState({annotations, instructions: null, region, overlays: []});
      return;
    }
    let annotations = this.state.annotations;
    let placeFound  = annotations.find( annotation => annotation.title === place.title)
    let newRegion = Object.assign({}, this.state.region, {
      latitude:placeFound.latitude,
      longitude: placeFound.longitude
    });
    let newAnnotations = [placeFound];
    this.setState({region: newRegion});
  }


  onFocus(event, place){
    let locobject = {lat: place.latitude, lng: place.longitude};
    this.drawRoute(place, this.state.locationCurrent, locobject);
    if (place.gplaceid){
      //gservices.fetchDetails(place.gplaceid).then(data => console.log('details', data));
    }
    else if (place.venueid){
      //fsservices.fetchDetails(place.venueid).then(data => console.log('vendetails', data));
    }
  }

  onBlur(){
    console.log(' on bluring ');
    let region = this.state.locationCurrent;
    this.setState({annotations: this.state.annotationsAll,overlays: [], region});
  }

  onRowSelect(place){
    this.onFocus(null, place);
  }
  drawRoute(place, current, destination){
    gservices.drawRoute(current, destination)
    .then(route => {
      console.log('legs', route.legs[0].steps);
      let decodedPolylines = route.legs[0].steps.map(step => polyline.decode(step.polyline.points));
      let flattenPolylines =  decodedPolylines.reduce((a,b) => a.concat(b))
        .map(arr =>{
          return {
            latitude: arr[0],
            longitude: arr[1]
          }

        }); 
      let overlays = [
        {coordinates: flattenPolylines, 
         strokeColor: 'yellow',
        lineWidth: 5}
      ];
      let leg = route.legs[0];
      let instructions = removeHtml(leg.steps[0].html_instructions)+' '+leg.steps[0].distance.text;
      let details = { end_location: leg.end_location, address: leg.end_address, distance: leg.distance.value+' m', duration: leg.duration.text};
      let region = gservices.calculateRegion(route.bounds.northeast, route.bounds.southwest);      
      let placeAndDetails = Object.assign({},place, details);
      this.setState({annotations: [placeAndDetails], overlays, details,region, instructions});
    });
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
                mapType={this.state.mapType}
                region={this.state.region}
                overlays={this.state.overlays}
                instructions={this.state.instructions}
                annotations={this.state.annotations}
                onFocusing={this._onFocusing}
                onRowSelect={this.onRowSelect}
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
          switch(route.__navigatorRouteID){
            case 0:
              return this._createMainScene();
            case 1:
              return (<Settings
                        type={this.state.type}
                        mapType={this.state.mapType}
                        radius={this.state.radius}
                        changeValue={this.changeValue}
                        valueChanged={this.valueChanged}
                        radiusChanged={this.radiusChanged}
                        save={this.save}
                      />)
            default:
              return this._createMainScene();    
          }
        }}
        navigationBar={
          <Navigator.NavigationBar
            style={{backgroundColor: 'white', height: 10 }}
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
        style={{}} />
    );
  }
}

