import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Lazy‑loaded page components
const OnboardingScreen = lazy(() => import('./pages/OnboardingScreen'));
const WelcomeScreen = lazy(() => import('./pages/WelcomeScreen'));
const LoginScreen = lazy(() => import('./pages/LoginScreen'));
const SignupScreen = lazy(() => import('./pages/SignupScreen'));
const HomePage = lazy(() => import('./pages/HomePage'));
const TripDetailScreen = lazy(() => import('./pages/TripDetailScreen'));
const CreateTripScreen = lazy(() => import('./pages/CreateTripScreen'));
const MyTripsScreen = lazy(() => import('./pages/MyTripsScreen'));
const ExploreScreen = lazy(() => import('./pages/ExploreScreen'));
const SavedScreen = lazy(() => import('./pages/SavedScreen'));
const ItineraryBuilderScreen = lazy(() => import('./pages/ItineraryBuilderScreen'));
const ItineraryViewScreen = lazy(() => import('./pages/ItineraryViewScreen'));
const BudgetScreen = lazy(() => import('./pages/BudgetScreen'));
const PackingScreen = lazy(() => import('./pages/PackingScreen'));
const JournalScreen = lazy(() => import('./pages/JournalScreen'));
const ProfileScreen = lazy(() => import('./pages/ProfileScreen'));
const DestinationDetailScreen = lazy(() => import('./pages/DestinationDetailScreen'));
const AuthFlowScreen = lazy(() => import('./pages/AuthFlowScreen'));
const NotificationsScreen = lazy(() => import('./pages/NotificationsScreen'));
const GlobalSearchScreen = lazy(() => import('./pages/GlobalSearchScreen'));

import TravelChatbot from './components/chatbot/TravelChatbot';
import ProtectedRoute from './components/ui/ProtectedRoute';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Provider } from 'react-redux';
import { store } from './store';
import FullScreenSpinner from './components/ui/FullScreenSpinner';

function PrivatePage({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<FullScreenSpinner />}>
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
          </Suspense>
      </ErrorBoundary>
      <TravelChatbot />
    </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}
