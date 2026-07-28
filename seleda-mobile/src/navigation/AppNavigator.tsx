/**
 * App Navigator
 * Main navigation structure for the SELEDA mobile app
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import ReservationsScreen from '../screens/ReservationsScreen';
import RoomsScreen from '../screens/RoomsScreen';
import GuestsScreen from '../screens/GuestsScreen';
import RevenueScreen from '../screens/RevenueScreen';
import ChannelManagerScreen from '../screens/ChannelManagerScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Types
type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Reservations: undefined;
  Rooms: undefined;
  Guests: undefined;
  Revenue: undefined;
  ChannelManager: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Reservations" component={ReservationsScreen} />
      <Tab.Screen name="Rooms" component={RoomsScreen} />
      <Tab.Screen name="Guests" component={GuestsScreen} />
      <Tab.Screen name="Revenue" component={RevenueScreen} />
      <Tab.Screen name="ChannelManager" component={ChannelManagerScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
