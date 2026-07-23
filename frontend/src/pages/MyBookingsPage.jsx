import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyBookings, cancelBooking } from '../api/bookingApi.js';
import { Link } from 'react-router-dom';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        const data = await getMyBookings(token);
        setBookings(data);
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchBookings();
    }
  }, [token]);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await cancelBooking(token, bookingId);
      // Remove the cancelled booking from the local state
      setBookings(bookings.filter(b => b._id !== bookingId));
      alert('✅ Booking cancelled successfully');
    } catch (err) {
      alert(`❌ Error cancelling booking: ${err.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-bold text-gray-500 animate-pulse">📋 Loading your bookings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-md text-center">
          <span className="text-3xl">⚠️</span>
          <h3 className="text-lg font-bold text-red-800 mt-2">Failed to Load Bookings</h3>
          <p className="text-sm text-red-600 mt-1">{error}</p>
          <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            Back to Venues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">
              {user?.name ? `Welcome, ${user.name}` : ''} — {bookings.length} active booking{bookings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            ← Browse Venues
          </Link>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
            <span className="text-5xl">📅</span>
            <h3 className="text-lg font-bold text-gray-800 mt-4">No Bookings Yet</h3>
            <p className="text-sm text-gray-500 mt-2">You haven't made any bookings yet.</p>
            <Link
              to="/"
              className="mt-4 inline-block px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              Browse Venues
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{booking.venueName}</h3>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 text-xs uppercase font-semibold">Date</span>
                        <p className="font-medium text-gray-800">{booking.date}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs uppercase font-semibold">Time</span>
                        <p className="font-medium text-gray-800">{booking.startTime}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs uppercase font-semibold">Duration</span>
                        <p className="font-medium text-gray-800">{booking.duration} hr{booking.duration > 1 ? 's' : ''}</p>
                      </div>
                      <div>
                        <span className="text-gray-500 text-xs uppercase font-semibold">Total</span>
                        <p className="font-bold text-blue-600">Rs. {booking.totalCost}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                      {booking.status}
                    </span>
                    <button
                      onClick={() => handleCancel(booking._id)}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium rounded-lg border border-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

