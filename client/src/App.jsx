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
import AuditLogs from './pages/AuditLogs';
import ConsentRecommendations from './pages/ConsentRecommendations';
import JourneyOutcomes from './pages/JourneyOutcomes';
import { ForgotPassword } from './pages/ForgotPassword';
import { Directory } from './pages/Directory';
import { MessagesPage } from './pages/MessagesPage';

// Role definitions
const INTERNAL_ROLES = ['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics', 'Service Agent', 'Sales Manager', 'Marketing Manager'];
const ALL_ROLES = [...INTERNAL_ROLES, 'Customer'];

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected layout wrapper */}
            <Route element={
              <ProtectedRoute allowedRoles={ALL_ROLES}>
                <MainLayout />
              </ProtectedRoute>
            }>
              {/* Internal staff dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
                  <Dashboard />
                </ProtectedRoute>
              } />

              {/* Customer portal — Customers only */}
              <Route path="/portal" element={
                <ProtectedRoute allowedRoles={['Customer']}>
                  <CustomerPortal />
                </ProtectedRoute>
              } />

              {/* Product Journey — all operational roles */}
              <Route path="/journey" element={
                <ProtectedRoute allowedRoles={['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics']}>
                  <ProductJourney />
                </ProtectedRoute>
              } />
              {/* Legacy /orders route */}
              <Route path="/orders" element={
                <ProtectedRoute allowedRoles={['Admin', 'Production Team', 'Quality Control (QC)', 'Quality Assurance (QA)', 'Warehouse', 'Logistics']}>
                  <ProductJourney />
                </ProtectedRoute>
              } />

              {/* Complaints — Admin, Service Agent, operational departments */}
              <Route path="/complaints" element={
                <ProtectedRoute allowedRoles={['Admin', 'Service Agent', 'Quality Control (QC)', 'Production Team', 'Warehouse', 'Logistics']}>
                  <ComplaintManagement />
                </ProtectedRoute>
              } />

              {/* Messages - All logged in users */}
              <Route path="/messages" element={<MessagesPage />} />

              {/* Marketing & Outreach — Admin, Marketing/Sales */}
              <Route path="/marketing" element={
                <ProtectedRoute allowedRoles={['Admin', 'Marketing Manager', 'Sales Manager']}>
                  <MarketingOutreach />
                </ProtectedRoute>
              } />

              {/* Predictive Analytics — Admin, Marketing/Sales */}
              <Route path="/analytics" element={
                <ProtectedRoute allowedRoles={['Admin', 'Marketing Manager', 'Sales Manager']}>
                  <PredictiveAnalytics />
                </ProtectedRoute>
              } />

              {/* Reports — Admin, Marketing, Sales, QA */}
              <Route path="/reports" element={
                <ProtectedRoute allowedRoles={['Admin', 'Marketing Manager', 'Sales Manager', 'Quality Assurance (QA)']}>
                  <Reports />
                </ProtectedRoute>
              } />

              {/* User Management — Admin only */}
              <Route path="/users" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />

              {/* System Settings — All users */}
              <Route path="/settings" element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <SystemSettings />
                </ProtectedRoute>
              } />

              {/* Directory — All internal roles */}
              <Route path="/directory" element={
                <ProtectedRoute allowedRoles={INTERNAL_ROLES}>
                  <Directory />
                </ProtectedRoute>
              } />

              {/* Audit Logs — Admin only */}
              <Route path="/audit" element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AuditLogs />
                </ProtectedRoute>
              } />

              {/* Consent Recommendations — Admin, Marketing */}
              <Route path="/consent" element={
                <ProtectedRoute allowedRoles={['Admin', 'Marketing Manager']}>
                  <ConsentRecommendations />
                </ProtectedRoute>
              } />

              {/* Journey Outcomes — Admin, Marketing, Sales */}
              <Route path="/outcomes" element={
                <ProtectedRoute allowedRoles={['Admin', 'Marketing Manager', 'Sales Manager']}>
                  <JourneyOutcomes />
                </ProtectedRoute>
              } />

              {/* Notifications — all authenticated users */}
              <Route path="/notifications" element={
                <ProtectedRoute allowedRoles={ALL_ROLES}>
                  <Notifications />
                </ProtectedRoute>
              } />

              {/* Catch-all for unknown protected paths */}
              <Route path="/app/*" element={<Navigate to="/dashboard" replace />} />
            </Route>

            {/* Global catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
