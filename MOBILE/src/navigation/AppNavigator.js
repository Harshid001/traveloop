import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform, Text, View } from 'react-native';
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
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F8FAFC',
    primary: '#0F9D8F',
  },
};

const TAB_CONFIG = [
  { name: 'Home', letter: 'H', label: 'Home' },
  { name: 'Explore', letter: 'E', label: 'Explore' },
  { name: 'MyTrips', letter: 'T', label: 'Trips' },
  { name: 'Wishlist', letter: 'W', label: 'Wishlist' },
  { name: 'Profile', letter: 'P', label: 'Profile' },
];

const tabLetters = {};
TAB_CONFIG.forEach((t) => {
  tabLetters[t.name] = t.letter;
});

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#0F9D8F',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
          marginTop: 2,
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 72,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
        },
        tabBarIcon: ({ color, focused }) => (
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? '#E6F7F5' : 'transparent',
            }}
          >
            <Text
              style={{
                color,
                fontSize: 14,
                fontWeight: '800',
              }}
            >
              {tabLetters[route.name]}
            </Text>
          </View>
        ),
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
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="TripDetails" component={TripDetailsScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
