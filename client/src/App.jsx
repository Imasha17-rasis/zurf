import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SurfSpotDetails from './pages/SurfSpotDetails';
import BookingPage from './pages/BookingPage';
import Profile from './pages/Profile';
import DashboardOwner from './pages/DashboardOwner';
import DashboardGuide from './pages/DashboardGuide';
import AdminPanel from './pages/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Layout Component
const Layout = ({ children, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      {children}
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/surf-spots/:id"
          element={
            <Layout>
              <SurfSpotDetails />
            </Layout>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Layout showNavbar={false}>
                <Login />
              </Layout>
            )
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/" />
            ) : (
              <Layout showNavbar={false}>
                <Register />
              </Layout>
            )
          }
        />

        {/* Protected Routes - Surfer */}
        <Route
          path="/my-bookings"
          element={
            <ProtectedRoute allowedRoles={['surfer']}>
              <Layout>
                <BookingPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Owner */}
        <Route
          path="/dashboard/owner/*"
          element={
            <ProtectedRoute allowedRoles={['owner']}>
              <DashboardOwner />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Guide */}
        <Route
          path="/dashboard/guide/*"
          element={
            <ProtectedRoute allowedRoles={['guide']}>
              <DashboardGuide />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Profile Route - All authenticated users */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* 404 Route */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-xl text-gray-600 mb-8">Page not found</p>
                  <a
                    href="/"
                    className="bg-ocean-500 hover:bg-ocean-600 text-white px-6 py-3 rounded-lg font-medium transition"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;