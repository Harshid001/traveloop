import { Routes, Route, Navigate } from 'react-router-dom';
import OnboardingScreen from './pages/OnboardingScreen';
import WelcomeScreen from './pages/WelcomeScreen';
import LoginScreen from './pages/LoginScreen';
import SignupScreen from './pages/SignupScreen';
import HomePage from './pages/HomePage';
import TripDetailScreen from './pages/TripDetailScreen';
import CreateTripScreen from './pages/CreateTripScreen';
import MyTripsScreen from './pages/MyTripsScreen';
import ExploreScreen from './pages/ExploreScreen';
import SavedScreen from './pages/SavedScreen';
import ItineraryBuilderScreen from './pages/ItineraryBuilderScreen';
import ItineraryViewScreen from './pages/ItineraryViewScreen';
import BudgetScreen from './pages/BudgetScreen';
import PackingScreen from './pages/PackingScreen';
import JournalScreen from './pages/JournalScreen';
import ProfileScreen from './pages/ProfileScreen';
import DestinationDetailScreen from './pages/DestinationDetailScreen';
import AuthFlowScreen from './pages/AuthFlowScreen';
import NotificationsScreen from './pages/NotificationsScreen';
import GlobalSearchScreen from './pages/GlobalSearchScreen';
import TravelChatbot from './components/chatbot/TravelChatbot';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function PrivatePage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/onboarding" replace />} />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/welcome" element={<WelcomeScreen />} />

        <Route path="/login" element={<LoginScreen />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/forgot-password" element={<AuthFlowScreen mode="forgot" />} />
        <Route path="/reset-password" element={<AuthFlowScreen mode="reset" />} />
        <Route path="/verify-email" element={<AuthFlowScreen mode="verify" />} />
        <Route path="/complete-profile" element={<PrivatePage><AuthFlowScreen mode="complete" /></PrivatePage>} />

        <Route path="/home" element={<PrivatePage><HomePage /></PrivatePage>} />
        <Route path="/trip/:id" element={<PrivatePage><TripDetailScreen /></PrivatePage>} />
        <Route path="/create-trip" element={<PrivatePage><CreateTripScreen /></PrivatePage>} />
        <Route path="/my-trips" element={<PrivatePage><MyTripsScreen /></PrivatePage>} />
        <Route path="/explore" element={<PrivatePage><ExploreScreen /></PrivatePage>} />
        <Route path="/destinations/:id" element={<PrivatePage><DestinationDetailScreen /></PrivatePage>} />
        <Route path="/saved" element={<PrivatePage><SavedScreen /></PrivatePage>} />
        <Route path="/notifications" element={<PrivatePage><NotificationsScreen /></PrivatePage>} />
        <Route path="/search" element={<PrivatePage><GlobalSearchScreen /></PrivatePage>} />

        <Route path="/itinerary-builder" element={<PrivatePage><ItineraryBuilderScreen /></PrivatePage>} />
        <Route path="/itinerary-view" element={<PrivatePage><ItineraryViewScreen /></PrivatePage>} />
        <Route path="/budget" element={<PrivatePage><BudgetScreen /></PrivatePage>} />
        <Route path="/packing" element={<PrivatePage><PackingScreen /></PrivatePage>} />
        <Route path="/journal" element={<PrivatePage><JournalScreen /></PrivatePage>} />
        <Route path="/profile" element={<PrivatePage><ProfileScreen /></PrivatePage>} />

        <Route path="*" element={<Navigate to="/onboarding" replace />} />
      </Routes>
      <TravelChatbot />
    </AuthProvider>
  );
}
