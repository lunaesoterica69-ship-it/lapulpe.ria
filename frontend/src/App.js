import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthCallback from './pages/AuthCallback';
import MapView from './pages/MapView';
import PulperiaProfile from './pages/PulperiaProfile';
import SearchProducts from './pages/SearchProducts';
import ShoppingCart from './pages/ShoppingCart';
import MyOrders from './pages/MyOrders';
import PulperiaDashboard from './pages/PulperiaDashboard';
import Messages from './pages/Messages';
import UserProfile from './pages/UserProfile';
import ProtectedRoute from './components/ProtectedRoute';
import UserTypeSelector from './pages/UserTypeSelector';
import JobsServices from './pages/JobsServices';
import OrderHistory from './pages/OrderHistory';
import Advertising from './pages/Advertising';
import './App.css';

function AppRouter() {
  const location = useLocation();
  
  // Handle authentication callback
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
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
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
          <Toaster position="top-center" richColors />
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
