import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Onboarding from '@/pages/Onboarding';
import Discover from '@/pages/Discover';
import Browse from '@/pages/Browse';
import Matches from '@/pages/Matches';
import Messages from '@/pages/Messages';
import Chat from '@/pages/Chat';
import ProfilePage from '@/pages/ProfilePage';
import Premium from '@/pages/Premium';
import LikedYou from '@/pages/LikedYou';
import Admin from '@/pages/Admin';
import OnboardingDashboard from '@/pages/OnboardingDashboard';
import SafetyHub from '@/pages/SafetyHub';
import Settings from '@/pages/Settings';
import SafetyCenter from '@/pages/SafetyCenter';
import DateSafety from '@/pages/DateSafety';
import Events from '@/pages/Events';
import ScamAwareness from '@/pages/ScamAwareness';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Landing />} />}>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Layout />}>
          <Route path="/discover" element={<Discover />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/chat/:matchId" element={<Chat />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/premium" element={<Premium />} />
          <Route path="/liked-you" element={<LikedYou />} />
          <Route path="/safety-hub" element={<SafetyHub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/safety-center" element={<SafetyCenter />} />
          <Route path="/date-safety/:matchId" element={<DateSafety />} />
          <Route path="/events" element={<Events />} />
          <Route path="/scam-awareness" element={<ScamAwareness />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/onboarding-dashboard" element={<OnboardingDashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App