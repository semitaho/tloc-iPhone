import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';
  
 export default class InstructionsView extends Component{
  render(){
      return (
        <View style={{alignItems: 'center'}}>
            <Text style={{fontSize: 15, marginBottom: 10, fontWeight: 'bold'}}>{this.props.instructions}</Text>
        </View>)
  }

}
