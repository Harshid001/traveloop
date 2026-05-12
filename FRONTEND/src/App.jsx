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
import TravelChatbot from './components/chatbot/TravelChatbot';

export default function App() {
  return (
    <>
    <Routes>
      {/* Entry → Onboarding */}
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="/onboarding" element={<OnboardingScreen />} />

      {/* Welcome */}
      <Route path="/welcome" element={<WelcomeScreen />} />

      {/* Auth */}
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/signup" element={<SignupScreen />} />

      {/* Dashboard */}
      <Route path="/home" element={<HomePage />} />

      {/* Trip pages */}
      <Route path="/trip/:id" element={<TripDetailScreen />} />
      <Route path="/create-trip" element={<CreateTripScreen />} />
      <Route path="/my-trips" element={<MyTripsScreen />} />
      <Route path="/explore" element={<ExploreScreen />} />
      <Route path="/saved" element={<SavedScreen />} />

      {/* Advanced features */}
      <Route path="/itinerary-builder" element={<ItineraryBuilderScreen />} />
      <Route path="/itinerary-view" element={<ItineraryViewScreen />} />
      <Route path="/budget" element={<BudgetScreen />} />
      <Route path="/packing" element={<PackingScreen />} />
      <Route path="/journal" element={<JournalScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/onboarding" replace />} />
    </Routes>
    <TravelChatbot />
    </>
  );
}
