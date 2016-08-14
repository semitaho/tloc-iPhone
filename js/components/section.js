import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';


export default props => {
  return (<View style={{paddingVertical: 10}}><Text style={{fontWeight: 'bold', marginBottom: 15}} >{props.title}</Text>{props.children}</View>)
};

