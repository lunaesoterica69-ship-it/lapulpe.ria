import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import './App.css';

// Lazy load all other pages for faster initial load
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const GoogleCallback = lazy(() => import('./pages/GoogleCallback'));
const MapView = lazy(() => import('./pages/MapView'));
const PulperiaProfile = lazy(() => import('./pages/PulperiaProfile'));
const SharedPulperiaLink = lazy(() => import('./pages/SharedPulperiaLink'));
const SearchProducts = lazy(() => import('./pages/SearchProducts'));
const ShoppingCart = lazy(() => import('./pages/ShoppingCart'));
const MyOrders = lazy(() => import('./pages/MyOrders'));
const PulperiaDashboard = lazy(() => import('./pages/PulperiaDashboard'));
const Messages = lazy(() => import('./pages/Messages'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));
const UserTypeSelector = lazy(() => import('./pages/UserTypeSelector'));
const JobsServices = lazy(() => import('./pages/JobsServices'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));
const Advertising = lazy(() => import('./pages/Advertising'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const AdAssignmentLog = lazy(() => import('./pages/AdAssignmentLog'));

// Simple loading spinner
const LoadingSpinner = () => (
  <div className="min-h-screen bg-stone-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
  </div>
);

function AppRouter() {
  const location = useLocation();
  
  if (location.hash?.includes('session_id=')) {
    return (
      <Suspense fallback={<LoadingSpinner />}>
        <AuthCallback />
      </Suspense>
    );
  }
  
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
        <Route path="/p/:id" element={<SharedPulperiaLink />} />
        <Route path="/select-type" element={<ProtectedRoute><UserTypeSelector /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
        <Route path="/pulperia/:id" element={<ProtectedRoute><PulperiaProfile /></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><SearchProducts /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><ShoppingCart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><PulperiaDashboard /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
        <Route path="/jobs-services" element={<ProtectedRoute><JobsServices /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        <Route path="/advertising" element={<ProtectedRoute><Advertising /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/ad-log" element={<AdAssignmentLog />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster 
            position="top-center" 
            richColors 
            toastOptions={{
              style: {
                background: '#DC2626',
                color: 'white',
                border: 'none'
              }
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
