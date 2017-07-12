import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';


export default props => {
  return (<View style={{flexDirection: 'row', padding: 5, borderBottomWidth: 1, borderColor: 'gray', alignItems: 'center', justifyContent: 'space-between'}}>
            <Text style={{flex: 2, fontWeight: 'bold'}}>{props.title}</Text>
            <View style={{flex: 3}}>
              {props.children}
            </View>
          </View>)
};

