import React, { Component } from 'react'; 
import {
  View,
  Text
} from 'react-native';
  
 export default class InstructionsView extends Component{
  render(){
      return (
        <View>
            <Text style={{fontSize: 15, fontWeight: 'bold', alignItems: 'center'}}>{this.props.instructions}</Text>
        </View>)
  }

}
