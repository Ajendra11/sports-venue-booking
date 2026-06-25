import React, { useState } from 'react';
import { sampleVenues } from './data/venues';
import VenueCard from './components/VenueCard';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');

  // Extract unique sports categories dynamically
  const sportsTypes = ['All', ...new Set(sampleVenues.map(v => v.sportType))];

  // Dynamic filter processing
  const filteredVenues = sampleVenues.filter(venue => {
    const matchesSearch = 
      venue.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      venue.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSport = 
      selectedSport === '' || selectedSport === 'All' || venue.sportType === selectedSport;

    return matchesSearch && matchesSport;
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      
      {/* Header Bar */}
      <header className="bg-blue-600 text-white py-6 shadow-md">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">🏟️ Hamro Khelkud Booking</h1>
            <p className="text-xs text-blue-100 mt-0.5">Find and reserve local sports venues instantly</p>
          </div>
          <span className="bg-blue-500 text-xs px-3 py-1 rounded-md font-mono border border-blue-400">
            Week 1 Setup
          </span>
        </div>
      </header>

      {/* Main Interactive Controls */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Search & Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Search Facilities</label>
            <input
              type="text"
              placeholder="Search by name or location (e.g., Kathmandu, Thamel)..."
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

        {/* Available Count Display */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Available Venues</h2>
          <span className="text-sm font-semibold bg-gray-200 text-gray-700 px-3 py-0.5 rounded-full">
            {filteredVenues.length} Results
          </span>
        </div>
        
        {/* Responsive Grid Layout (Your grid code goes here inside the component return) */}
        {filteredVenues.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.map(venue => {
              if (!venue) return null; 
              
              return (
                <div key={venue.id} className="flex">
                  <VenueCard venue={venue} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm max-w-md mx-auto mt-8">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-800 mt-3">No Facilities Match</h3>
            <p className="text-gray-500 text-sm mt-1 px-4">
              We couldn't find matches for your search criteria.
            </p>
          </div>
        )}
      </main>

    </div>
  );
}