import React, { useState, useEffect } from 'react'; 
import { sampleVenues } from './data/venues';
import VenueCard from './components/VenueCard';
import BookingModal from './components/BookingModal';
import AddVenueModal from './components/AddVenueModal'; 

export default function App() {
  // --- STATE HOOKS (With LocalStorage Fallbacks) ---
  const [venuesList, setVenuesList] = useState(() => {
    const savedVenues = localStorage.getItem('hk_venues');
    return savedVenues ? JSON.parse(savedVenues) : sampleVenues;
  }); 

  const [myBookings, setMyBookings] = useState(() => {
    const savedBookings = localStorage.getItem('hk_bookings');
    return savedBookings ? JSON.parse(savedBookings) : [];
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedVenueForBooking, setSelectedVenueForBooking] = useState(null);

  // --- EFFECT 1: VIVA TAB TITLE SYNC ---
  useEffect(() => {
    if (myBookings.length > 0) {
      document.title = `🏟️ Sports App (${myBookings.length} Bookings)`;
    } else {
      document.title = "🏟️ Sports Booking WebApp";
    }
  }, [myBookings]);

  // --- EFFECT 2: DATA PERSISTENCE SIDE EFFECT ---
  useEffect(() => {
    localStorage.setItem('hk_venues', JSON.stringify(venuesList));
  }, [venuesList]);

  useEffect(() => {
    localStorage.setItem('hk_bookings', JSON.stringify(myBookings));
  }, [myBookings]);

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
  const handleBookingSuccess = (newBooking) => {
    setMyBookings([...myBookings, newBooking]);
    setSelectedVenueForBooking(null);
    alert(`🎉 Booking Confirmed for ${newBooking.venueName}!`);
  };

  const handleAddVenueSuccess = (newVenue) => {
    setVenuesList([newVenue, ...venuesList]); 
    setIsAddModalOpen(false); 
    alert(`🏟️ "${newVenue.name}" successfully added!`);
  };

  // --- NEW HANDLER FOR WEEK 3: CANCELLATION ---
  const handleCancelBooking = (bookingId) => {
    if (window.confirm("Are you sure you want to cancel this booking?")) {
      const updatedBookings = myBookings.filter(b => b.id !== bookingId);
      setMyBookings(updatedBookings);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Header Bar */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Sports Booking WebApp</h1>
            <p className="text-xs text-blue-100 mt-0.5">Find and reserve local sports venues instantly</p>
          </div>
          
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-white hover:bg-gray-100 text-blue-600 font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-colors border border-blue-100"
          >
            ➕ Add Venue Facility
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Active Bookings Summary Section */}
        {myBookings.length > 0 && (
          <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wide mb-3">🗓️ Your Active Bookings ({myBookings.length})</h3>
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
                      title="Cancel Booking"
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
              <div key={venue.id} className="flex">
                <VenueCard 
                  venue={venue} 
                  onBookClick={(v) => setSelectedVenueForBooking(v)} 
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

      {/* Form Overlay Popup Modals */}
      {selectedVenueForBooking && (
        <BookingModal 
          venue={selectedVenueForBooking}
          onClose={() => setSelectedVenueForBooking(null)}
          onBookSuccess={handleBookingSuccess}
        />
      )}

      {isAddModalOpen && (
        <AddVenueModal 
          onClose={() => setIsAddModalOpen(false)}
          onAddSuccess={handleAddVenueSuccess}
        />
      )}
    </div>
  );
}