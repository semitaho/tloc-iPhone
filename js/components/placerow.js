import React, { Component } from 'react'; 
import {
  View,
  Text,
  TouchableHighlight

} from 'react-native';
export default props => {
  return (
        <TouchableHighlight onPress={event => props.onPress(props)} onPressIn={event => props.onFocusing(props, true) } onPressOut={event => props.onFocusing(props,false) } >
          <View style={{paddingVertical: 10, flexDirection: 'row', borderBottomWidth: 1, borderColor: 'gray'}} >
            <View style={{flex: 5}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>{props.title}</Text>
              <Text>{props.category}</Text>
              <Text>{props.address}</Text>
              <Text style={{fontWeight: 'bold'}}>{props.status}</Text>
            </View>
            {props.distance ?
            <View style={{flex: 2}}>
                <Text style={{fontSize: 10, textAlign: 'right'}}>Distance: {props.distance}</Text>
            </View> : null}
          </View>
        </TouchableHighlight>)


}; 
