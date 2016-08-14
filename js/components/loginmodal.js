import React, { Component } from 'react';
import gservices from './../actions/googleservices.js';
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
                  this.props.onSuccess();
                }
              }
            }
            onLogoutFinished={() => alert("User logged out")}
          />

           </View>)
  }
  componentDidMount(){
    /*
    AccessToken.getCurrentAccessToken().then(
                  (data) => {
                    alert(data.accessToken.toString())
                  }
                );
*/
  }

}