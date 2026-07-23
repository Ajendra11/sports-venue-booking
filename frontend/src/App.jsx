import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import { createBooking } from './api/bookingApi.js';
import VenueCard from './components/VenueCard';
import BookingModal from './components/BookingModal';
import AddVenueModal from './components/AddVenueModal';
import EditVenueModal from './components/EditVenueModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MyBookingsPage from './pages/MyBookingsPage';

// Points cleanly to your exact backend route listener
const API_BASE_URL = 'http://localhost:3000/api/venues';

// Home page component - venue listing
function HomePage({ venuesList, setVenuesList, isLoading, error, searchTerm, setSearchTerm, selectedSport, setSelectedSport, sportsTypes, filteredVenues, handleDeleteVenue, setSelectedVenueForBooking, setIsAddModalOpen, setSelectedVenueForEdit, myBookings, handleCancelBooking }) {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Active Bookings Summary Section */}
      {myBookings.length > 0 && (
        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-3">🗓️ Active Bookings ({myBookings.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {myBookings.map((b) => (
              <div key={b.id} className="bg-white p-3 rounded-lg shadow-sm border border-emerald-100 text-xs flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800 text-sm">{b.venueName}</p>
                  <p className="text-gray-500 mt-0.5">Date: {b.date} | Time: {b.startTime} ({b.duration} hr)</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-emerald-600 text-sm bg-emerald-50 px-2.5 py-1 rounded-md">Rs. {b.totalCost}</span>
                  <button 
                    onClick={() => handleCancelBooking(b.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded font-bold"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters Dashboard Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Search Facilities</label>
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Sport Filter</label>
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {sportsTypes.map((sport, index) => (
              <option key={index} value={sport}>{sport}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Counter Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Available Venues</h2>
        <span className="text-sm font-semibold bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full">
          {filteredVenues.length} Results
        </span>
      </div>
      
      {/* Venues Showroom Grid */}
      {filteredVenues.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVenues.map(venue => (
            <div key={venue._id || venue.id} className="flex">
              <VenueCard 
                venue={venue} 
                onBookClick={(v) => setSelectedVenueForBooking(v)} 
                onDeleteClick={(id) => handleDeleteVenue(id)}
                onEditClick={(v) => setSelectedVenueForEdit(v)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto mt-8">
          <span className="text-4xl">🔍</span>
          <h3 className="text-lg font-bold text-gray-800 mt-3">No Facilities Match</h3>
        </div>
      )}
    </main>
  );
}

export default function App() {
  const { user, token, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // --- STATE HOOKS ---
  const [venuesList, setVenuesList] = useState([]); 
  const [myBookings, setMyBookings] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [selectedVenueForEdit, setSelectedVenueForEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null);

  // --- EFFECT 1: FETCH ---
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(API_BASE_URL);
        if (!response.ok) throw new Error(`Server returned status code ${response.status}`);

        const data = await response.json();
        setVenuesList(data);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(err.message || "Failed to sync with backend server database.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // --- DERIVED STATES ---
  const sportsTypes = ['All', ...new Set(venuesList.map(v => v.sportType))];

  const filteredVenues = venuesList.filter(venue => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSport = selectedSport === 'All' || venue.sportType === selectedSport;
    return matchesSearch && matchesSport;
  });

  // --- HANDLERS ---
  const handleBookingSuccess = async (newBooking) => {
    if (isAuthenticated && token) {
      // Persist booking to backend via API
      try {
        const savedBooking = await createBooking(token, {
          venueId: newBooking.venueId,
          date: newBooking.date,
          startTime: newBooking.startTime,
          duration: newBooking.duration
        });
        
        const bookingWithId = { 
          ...newBooking, 
          id: savedBooking._id || `book-${Date.now()}`,
          _id: savedBooking._id
        };
        setMyBookings([...myBookings, bookingWithId]);
        setSelectedVenueForBooking(null);
        alert(`🎉 Booking Confirmed for ${bookingWithId.venueName}!`);
      } catch (err) {
        alert(`❌ Booking failed: ${err.message}`);
      }
    } else {
      // Fallback to local-only booking if not authenticated
      const bookingWithId = { ...newBooking, id: newBooking.id || `book-${Date.now()}` };
      setMyBookings([...myBookings, bookingWithId]);
      setSelectedVenueForBooking(null);
      alert(`🎉 Booking Confirmed for ${bookingWithId.venueName}!`);
    }
  };

  const handleAddVenueSuccess = async (newVenue) => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenue)
      });

      if (!response.ok) throw new Error('Failed to save new venue entry');
      
      const savedVenue = await response.json();
      setVenuesList([savedVenue, ...venuesList]); 
      setIsAddModalOpen(false); 
      alert(`🏟️ "${savedVenue.name}" successfully committed to Database!`);
    } catch (err) {
      alert(`❌ Facility insertion error: ${err.message}`);
    }
  };

  const handleEditVenueSuccess = async (venueId, updatedData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${venueId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Failed to save edits to server database');

      const updatedVenue = await response.json();
      
      setVenuesList(venuesList.map(v => (v._id || v.id) === venueId ? updatedVenue : v));
      setSelectedVenueForEdit(null);
      alert(`🏟️ "${updatedVenue.name}" changes saved successfully!`);
    } catch (err) {
      alert(`❌ Update execution failed: ${err.message}`);
    }
  };

  const handleDeleteVenue = async (venueId) => {
    if (!window.confirm("Are you sure you want to permanently delete this venue from the database?")) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/${venueId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete venue from backend API');

      setVenuesList(venuesList.filter(v => (v._id || v.id) !== venueId));
      alert("🗑️ Venue successfully deleted from Database!");
    } catch (err) {
      alert(`❌ Error deleting venue: ${err.message}`);
    }
  };

  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      setMyBookings(myBookings.filter(b => b.id !== bookingId));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // --- LOADER & ERROR LAYOUTS ---
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-lg font-bold text-gray-500 animate-pulse">⚡ Synchronizing with Backend Database Server...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-red-50 border border-red-200 p-6 rounded-xl max-w-md text-center">
        <span className="text-3xl">⚠️</span>
        <h3 className="text-lg font-bold text-red-800 mt-2">Database Connection Failed</h3>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <p className="text-xs text-gray-400 mt-4 font-mono">Verify your Node.js backend app server is running on port 3001</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Navigation Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between py-4">
            {/* Logo / Home Link */}
            <Link to="/" className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight">Sports Booking</h1>
              <p className="text-xs text-blue-100">Fullstack WebApp</p>
            </Link>

            {/* Navigation Links */}
            <nav className="flex items-center gap-3">
              <Link 
                to="/" 
                className="text-sm text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-700"
              >
                Venues
              </Link>

              {isAuthenticated ? (
                <>
                  <Link 
                    to="/my-bookings" 
                    className="text-sm text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    My Bookings
                  </Link>
                  <div className="flex items-center gap-2 ml-2 pl-3 border-l border-blue-400">
                    <span className="text-xs text-blue-200 hidden sm:inline">
                      👤 {user?.name}
                    </span>
                    <button 
                      onClick={() => setIsAddModalOpen(true)}
                      className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-xs px-3 py-1.5 rounded-lg transition-colors"
                    >
                      ➕ Add Venue
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/30"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="text-sm text-blue-100 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-xs px-4 py-1.5 rounded-lg transition-colors"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Route Definitions */}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/my-bookings" element={
          isAuthenticated ? <MyBookingsPage /> : <LoginPage />
        } />
        <Route path="/" element={
          <HomePage 
            venuesList={venuesList}
            setVenuesList={setVenuesList}
            isLoading={isLoading}
            error={error}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedSport={selectedSport}
            setSelectedSport={setSelectedSport}
            sportsTypes={sportsTypes}
            filteredVenues={filteredVenues}
            handleDeleteVenue={handleDeleteVenue}
            setSelectedVenueForBooking={setSelectedVenueForBooking}
            setIsAddModalOpen={setIsAddModalOpen}
            setSelectedVenueForEdit={setSelectedVenueForEdit}
            myBookings={myBookings}
            handleCancelBooking={handleCancelBooking}
          />
        } />
      </Routes>

      {/* Form Overlay Popup Modals */}
      {selectedVenueForBooking && (
        <BookingModal 
          venue={selectedVenueForBooking}
          onClose={() => setSelectedVenueForBooking(null)}
          onBookSuccess={handleBookingSuccess}
          isAuthenticated={isAuthenticated}
        />
      )}

      {isAddModalOpen && (
        <AddVenueModal 
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={handleAddVenueSuccess}
        />
      )}

      {selectedVenueForEdit && (
        <EditVenueModal 
          venue={selectedVenueForEdit}
          onClose={() => setSelectedVenueForEdit(null)}
          onEditSuccess={handleEditVenueSuccess}
        />
      )}
    </div>
  );
}

