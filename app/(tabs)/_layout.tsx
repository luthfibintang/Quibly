import { icons } from '@/constants/icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();
const MaterialTopTabs = withLayoutContext(Navigator);

const { width } = Dimensions.get('window');

export default function _layout() {
  const insets = useSafeAreaInsets();
  
  return (
    <MaterialTopTabs
      screenOptions={({ route }) => ({
        swipeEnabled: true,
        animationEnabled: true,
        tabBarContentContainerStyle:{
          paddingHorizontal: 20,
        },
        tabBarStyle: {
          backgroundColor: 'black',
          // borderBottomWidth: 1,
          // borderBottomColor: 'rgb(31, 41, 55)', // gray-800
          paddingTop: insets.top + 10,
          paddingBottom: 10
        },
        tabBarIndicatorStyle: {
          backgroundColor: 'white',
          height: 2,
          width: 100,
          marginLeft: (width / 3 - 110) / 2, // Calculate the left margin to center the indicator, width / 3 is for 3 tabs - 110 is for width of the indicator + half of the icon size / 2 for centering
        },
        tabBarIndicatorContainerStyle: {
          alignItems: 'center',
          
        },
        tabBarShowLabel: false,
        tabBarIcon: ({ focused }) => {
          let iconSource;
          const routeName = route.name;
          
          if (routeName === 'index') {
            iconSource = icons.message;
          } else if (routeName === 'categoryDashboard') {
            iconSource = icons.inbox;
          } else if (routeName === 'routines') {
            iconSource = icons.routine;
          }
          
          return (
            <Image 
              source={iconSource}
              style={{
                width: 20,
                height: 20,
                tintColor: 'white',
                opacity: focused ? 1 : 0.5,
              }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <MaterialTopTabs.Screen
        name="index"
        options={{
          title: 'Chat',
        }}
      />
      <MaterialTopTabs.Screen
        name="categoryDashboard"
        options={{
          title: 'Categories',
        }}
      />
      <MaterialTopTabs.Screen
        name="routines"
        options={{
          title: 'Routines',
        }}
      />
    </MaterialTopTabs>
  );
}