import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, View, Text } from 'react-native';
import React from 'react';
import { Home, Compass, Map as MapIcon, Heart, User } from 'lucide-react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 20, color: 'red', fontWeight: 'bold' }}>Navigation Error</Text>
          <Text style={{ marginTop: 10 }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import TripDetailsScreen from '../screens/TripDetailsScreen';
import BookingScreen from '../screens/BookingScreen';
import MyTripsScreen from '../screens/MyTripsScreen';
import WishlistScreen from '../screens/WishlistScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import ItineraryBuilderScreen from '../screens/ItineraryBuilderScreen';
import ItineraryViewScreen from '../screens/ItineraryViewScreen';
import BudgetScreen from '../screens/BudgetScreen';
import PackingScreen from '../screens/PackingScreen';
import JournalScreen from '../screens/JournalScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import DestinationDetailScreen from '../screens/DestinationDetailScreen';
// Removed NotificationsScreen from Stack entirely as per requirements.

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC', // Brand background
    primary: '#0F9D8F',
  },
};

const TabIcon = ({ name, color, focused }) => {
  let IconComponent;
  switch (name) {
    case 'Home': IconComponent = Home; break;
    case 'Explore': IconComponent = Compass; break;
    case 'MyTrips': IconComponent = MapIcon; break;
    case 'Wishlist': IconComponent = Heart; break;
    case 'Profile': IconComponent = User; break;
    default: IconComponent = Home;
  }

  return (
    <View className={`items-center justify-center p-2 rounded-full ${focused ? 'bg-[#0F9D8F]/10' : ''}`}>
      <IconComponent size={24} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F9D8F',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'System', // Use modern default
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
          marginTop: 2,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          borderTopWidth: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.95)', // slight transparency for glass feel
          position: 'absolute', // Float over content potentially
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarIcon: (props) => <TabIcon name={route.name} {...props} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen name="MyTrips" component={MyTripsScreen} options={{ title: 'Trips' }} />
      <Tab.Screen name="Wishlist" component={WishlistScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <ErrorBoundary>
      <NavigationContainer theme={theme}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
          <Stack.Screen name="DestinationDetail" component={DestinationDetailScreen} />
          <Stack.Screen name="Booking" component={BookingScreen} />
          <Stack.Screen name="CreateTrip" component={CreateTripScreen} />
          <Stack.Screen name="ItineraryBuilder" component={ItineraryBuilderScreen} />
          <Stack.Screen name="ItineraryView" component={ItineraryViewScreen} />
          <Stack.Screen name="Budget" component={BudgetScreen} />
          <Stack.Screen name="Packing" component={PackingScreen} />
          <Stack.Screen name="Journal" component={JournalScreen} />
          <Stack.Screen name="Chatbot" component={ChatbotScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
