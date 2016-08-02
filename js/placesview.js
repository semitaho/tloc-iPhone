import React, { Component } from 'react'; 
import {
  ListView,
  Text
} from 'react-native';

import PlaceView from './placerow.js';

 export default class PlacesView extends Component{
  constructor(){
    super();
    this.ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
  }
  render(){
    let dataSource = this.ds.cloneWithRows(this.props.places);
    return (
        <ListView 
            style={this.props.style} 
            renderRow={rowData => <PlaceView {...rowData} 
                                    onFocusing={this.props.onFocusing} 
                                    onPress={this.props.onPress}
                                    />}
            dataSource={dataSource}>
        </ListView>)
  }

}