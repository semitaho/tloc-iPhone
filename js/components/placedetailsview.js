import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';
  
 export default class PlaceDetailsView extends Component{
  render(){
    return (
        <View style={this.props.style}>
            <Text>{this.props.address}</Text>
            <Text>{this.props.distance}</Text>
            <Text>{this.props.duration}</Text>
      
        </View>)
  }

}