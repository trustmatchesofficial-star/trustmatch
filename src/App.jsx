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
import Onboarding from '@/pages/Onboarding';
import Discover from '@/pages/Discover';
import Browse from '@/pages/Browse';
import Matches from '@/pages/Matches';
import Messages from '@/pages/Messages';
import Chat from '@/pages/Chat';
import ProfilePage from '@/pages/ProfilePage';
import Premium from '@/pages/Premium';
import Admin from '@/pages/Admin';
import SafetyHub from '@/pages/SafetyHub';
import Settings from '@/pages/Settings';
import DateSafety from '@/pages/DateSafety';

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
          <Route path="/safety-hub" element={<SafetyHub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/date-safety/:matchId" element={<DateSafety />} />
          <Route path="/admin" element={<Admin />} />
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