/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import MainPage from './MainPage'; // Import HomeScreen component
import CameraScreen from './CameraScreen'; // Import CameraScreen component
import ProfileScreen from './ProfileScreen'; // Import ProfileScreen component
import AntDesign from 'react-native-vector-icons/AntDesign';
import MyProjects from './MyProjects';

const Tab = createBottomTabNavigator();

const TabScreens = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false, // Optional: Hide labels if desired
      }}>
      <Tab.Screen
        name="MainPage"
        component={MainPage}
        options={{
          tabBarIcon: ({focused, color}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AntDesign name="home" size={30} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="MyProjects"
        component={MyProjects}
        options={{
          tabBarIcon: ({focused, color}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AntDesign name="videocamera" size={30} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({focused, color}) => (
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <AntDesign name="profile" size={30} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabScreens;
