import React, { Component } from 'react'; 
import {
  ListView,
  Text,
  View,
  Slider,
  Picker,
  AsyncStorage
} from 'react-native';
import SectionRow from './sectionrow.js';
import Section from './section.js';

export default class Settings extends Component{

  constructor(){
    super();
    this.state = {radius: 1000,  gasstations: false};
    this.changeSwitchValue = this.changeSwitchValue.bind(this);
  }
  

  componentWillUnmount(){
    console.log('unmountin');
  }
  
   
  render(){
    return (<View style={{flex: 1, marginTop: 70, justifyContent:'flex-start', alignItems: 'center'}}>
              <Section title="Search type of interest">
                  <Picker 
                          selectedValue={this.props.type} 
                          onValueChange={this.props.typeChanged}>
                    <Picker.Item label="Eating" value="food" />
                    <Picker.Item label="Post office" value="post_office" />
                    <Picker.Item label="Bicycle store" value="bicycle_store" />
                  </Picker>
              </Section>
              <Section title="Search radius">
                <Slider minimumValue={100} onSlidingComplete={this.props.radiusChanged}  value={this.props.radius} onValueChange={(val) => this.props.changeValue('radius', val) } step={100} maximumValue={5000} />
                <Text>Current radius {this.props.radius} meters</Text>
              </Section>
            </View>)
  }

  changeSwitchValue(property, value){
    }

}