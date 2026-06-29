import React, { useState } from 'react';
import { sampleVenues } from './data/venues';
import VenueCard from './components/VenueCard';

export default function App() {
  // State variables to handle text search and category filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');

  // Extract unique sports types dynamically for the dropdown filter
  const sportsTypes = ['All', ...new Set(sampleVenues.map(v => v.sportType))];

  // Filter logic based on user inputs
  const filteredVenues = sampleVenues.filter(venue => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = selectedSport === '' || selectedSport === 'All' || venue.sportType === selectedSport;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header Banner */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sports Venue Booking System</h1>
          <p className="mt-2 text-blue-100">Find and reserve your perfect sports facility instantly</p>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Search and Filter Inputs Grid */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Search Venues</label>
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="w-full md:w-64">
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Filter by Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {sportsTypes.map((sport, index) => (
                <option key={index} value={sport}>{sport}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Venue Listing Grid */}
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Venues ({filteredVenues.length})</h2>
        
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map(venue => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-lg">No venues found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  );
}