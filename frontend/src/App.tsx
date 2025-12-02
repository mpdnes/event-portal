import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import StaffDashboard from './pages/staff/Dashboard';
import SessionBrowser from './pages/staff/SessionBrowser';
import MyRegistrations from './pages/staff/MyRegistrations';
import EmailPreferences from './pages/staff/EmailPreferences';
import Calendar from './pages/Calendar';
// import TakeSurvey from './pages/TakeSurvey';
import AdminDashboard from './pages/admin/Dashboard';
import SessionManagement from './pages/admin/SessionManagement';
import SurveyManagement from './pages/admin/SurveyManagement';
import EmailManagement from './pages/admin/EmailManagement';
import UserManagement from './pages/admin/Users';
import TagManagement from './pages/admin/Tags';
import PresenterManagement from './pages/admin/Presenters';
import Navbar from './components/common/Navbar';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin' && user.role !== 'manager') {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Staff Routes */}
        <Route path="/" element={
          <PrivateRoute>
            <StaffDashboard />
          </PrivateRoute>
        } />
        <Route path="/sessions" element={
          <PrivateRoute>
            <SessionBrowser />
          </PrivateRoute>
        } />
        <Route path="/my-registrations" element={
          <PrivateRoute>
            <MyRegistrations />
          </PrivateRoute>
        } />
        <Route path="/email-preferences" element={
          <PrivateRoute>
            <EmailPreferences />
          </PrivateRoute>
        } />
        <Route path="/calendar" element={
          <PrivateRoute>
            <Calendar />
          </PrivateRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <PrivateRoute adminOnly>
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/admin/sessions" element={
          <PrivateRoute adminOnly>
            <SessionManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/sessions/:sessionId/surveys" element={
          <PrivateRoute adminOnly>
            <SurveyManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/emails" element={
          <PrivateRoute adminOnly>
            <EmailManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/users" element={
          <PrivateRoute adminOnly>
            <UserManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/tags" element={
          <PrivateRoute adminOnly>
            <TagManagement />
          </PrivateRoute>
        } />
        <Route path="/admin/presenters" element={
          <PrivateRoute adminOnly>
            <PresenterManagement />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  );
}

export default App;
