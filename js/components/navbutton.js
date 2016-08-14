import React, { Component } from 'react'; 
import {
  Text,
  TouchableHighlight
} from 'react-native';

export default ({label, onPress}) => {
  return (<TouchableHighlight onPress={onPress}>
            <Text style={{color: 'blue'}}>{label}</Text>
          </TouchableHighlight>)

};

