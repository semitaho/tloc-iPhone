import React, { Component } from 'react'; 
import {
  View,
  Text,
  TouchableHighlight

} from 'react-native';
export default props => {
  return (
        <TouchableHighlight onPress={event => props.onPress(props)} onPressIn={event => props.onFocusing(props, true) } onPressOut={event => props.onFocusing(props,false) } >
        <View style={{paddingVertical: 10, borderBottomWidth: 1, borderColor: 'gray'}} >
            <Text style={{fontWeight: 'bold', fontSize: 16}}>{props.title}</Text>
            <Text>{props.category}</Text>
            <Text>{props.address}</Text>
            <Text>{props.status}</Text>



          </View></TouchableHighlight>)


}; 
