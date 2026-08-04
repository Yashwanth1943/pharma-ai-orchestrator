import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { UserManagement } from './pages/UserManagement';
import { ComplaintManagement } from './pages/ComplaintManagement';
import { CustomerPortal } from './pages/CustomerPortal';
import { ProductJourney } from './pages/ProductJourney';
import { Notifications } from './pages/Notifications';
import { MarketingOutreach } from './pages/MarketingOutreach';
import { PredictiveAnalytics } from './pages/PredictiveAnalytics';
import { SystemSettings } from './pages/SystemSettings';
import { Reports } from './pages/Reports';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/orders" element={<ProductJourney />} />
              <Route path="/complaints" element={<ComplaintManagement />} />
              <Route path="/marketing" element={<MarketingOutreach />} />
              <Route path="/analytics" element={<PredictiveAnalytics />} />
              <Route path="/settings" element={<SystemSettings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/portal" element={<CustomerPortal />} />
              <Route path="/journey" element={<ProductJourney />} />
              <Route path="/notifications" element={<Notifications />} />
              {/* Additional routes will go here based on role */}
              
              {/* Catch all for protected routes */}
              <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
