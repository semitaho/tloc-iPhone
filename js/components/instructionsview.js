import React, { Component } from 'react'; 
import NavButton from './navbutton.js';
import {
  View,
  Text
} from 'react-native';
  
 export default class InstructionsView extends Component{
  render(){
      return (
        <View style={{flexDirection: 'row'}}>
            <Text style={{fontSize: 15, flex:2, fontWeight: 'bold', alignItems: 'center'}}>{this.props.instructions}</Text>
            <NavButton label="Cancel" onPress={this.props.onCancel} />
        
        </View>)
  }

}
