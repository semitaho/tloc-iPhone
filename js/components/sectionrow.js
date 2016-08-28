import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';

export default props => {
  return (<View style={{flexDirection: 'row', flex:1, justifyContent: 'space-around'}}>{props.children}</View>)
};