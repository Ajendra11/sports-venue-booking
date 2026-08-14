import { useCallback, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { useToast } from './components/ui/ToastProvider.jsx';
import { getVenues } from './api/venueApi.js';
import { createBooking } from './api/bookingApi.js';

import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import BookingModal from './components/BookingModal.jsx';
import AiChatDrawer from './components/AiChatDrawer.jsx';

import HomePage from './pages/HomePage.jsx';
import VenueDetailPage from './pages/VenueDetailPage.jsx';
import MyBookingsPage from './pages/MyBookingsPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminVenuesPage from './pages/admin/AdminVenuesPage.jsx';
import AdminBookingsPage from './pages/admin/AdminBookingsPage.jsx';

export default function App() {
  const { token, isAuthenticated } = useAuth();
  const toast = useToast();

  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [venueToBook, setVenueToBook] = useState(null);

  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setVenues(await getVenues());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const handleCreateBooking = async (bookingData) => {
    const saved = await createBooking(token, bookingData);
    setVenueToBook(null);
    toast.success(`Booked ${saved.venueName} for ${saved.slot} on ${saved.date}.`);
    return saved;
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar />

      <div className="flex-1">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                venues={venues}
                isLoading={isLoading}
                error={error}
                onRetry={fetchVenues}
                onBookClick={setVenueToBook}
              />
            }
          />
          <Route path="/venues/:id" element={<VenueDetailPage onBookClick={setVenueToBook} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          {/* Admin panel */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="venues" element={<AdminVenuesPage />} />
            <Route path="bookings" element={<AdminBookingsPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>

      {venueToBook && (
        <BookingModal
          venue={venueToBook}
          onClose={() => setVenueToBook(null)}
          onBookSuccess={handleCreateBooking}
          isAuthenticated={isAuthenticated}
        />
      )}

      <AiChatDrawer />
    </div>
  );
}
