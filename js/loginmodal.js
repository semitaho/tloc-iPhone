import React, { Component } from 'react';
import gservices from './googleservices.js';
import {
  AppRegistry,
  StyleSheet,
  Text,
  MapView,
  View,
  Modal,
  TouchableHighlight
} from 'react-native';
import FBSDK from 'react-native-fbsdk';
const {
  LoginButton,
  AccessToken
} = FBSDK;
export default class LoginModal extends Component {
  render(){
    console.log('aijaa');
    return (
         <View style={{marginTop: 70, marginLeft: 50}}>
          <LoginButton  
            publishPermissions={["publish_actions"]}
            onLoginFinished={
              (error, result) => {
                if (error) {
                  alert("Login failed with error: " + result.error);
                } else if (result.isCancelled) {
                  alert("Login was cancelled");

                } else {
                  alert("Login was successful with permissions: " + result.grantedPermissions)
                }
              }
            }
            onLogoutFinished={() => alert("User logged out")}
          />

           </View>)
  }

}