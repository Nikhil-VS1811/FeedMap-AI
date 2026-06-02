import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import DeliveryDashboard from './pages/dashboard/DeliveryDashboard';
import DonorDashboard from './pages/dashboard/DonorDashboard';
import NgoDashboard from './pages/dashboard/NgoDashboard';
import OverviewDashboard from './pages/dashboard/OverviewDashboard';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { toastOptions } from './utils/toast';

const App = () => (
  <>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OverviewDashboard />} />
        <Route
          path="donor"
          element={
            <ProtectedRoute roles={['donor', 'admin']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="ngo"
          element={
            <ProtectedRoute roles={['ngo', 'admin']}>
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="delivery"
          element={
            <ProtectedRoute roles={['delivery', 'admin']}>
              <DeliveryDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <Toaster
      position={toastOptions.position}
      gutter={toastOptions.gutter}
      containerStyle={toastOptions.containerStyle}
      toastOptions={{
        className: 'transition-all duration-300 ease-out',
      }}
    />
  </>
);

export default App;
