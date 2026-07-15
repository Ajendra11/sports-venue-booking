import React, { useState } from 'react';

export default function AddVenueModal({ onClose, onAddSuccess }) {
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('Futsal');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  
  // For simplicity without image uploads, we use a default placeholder sport image
  const defaultImages = {
    Futsal: "https://images.unsplash.com/photo-1577223625856-745524fb08bc?w=500&auto=format&fit=crop&q=60",
    Badminton: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=60",
    Basketball: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&auto=format&fit=crop&q=60",
    Tennis: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=500&auto=format&fit=crop&q=60",
    Swimming: "https://images.unsplash.com/photo-1519666336592-e225a99dbe2f?w=500&auto=format&fit=crop&q=60"
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !location || !pricePerHour) {
      alert("Please fill out all fields!");
      return;
    }

    const newVenue = {
      id: Date.now(), // Generate a unique ID using the timestamp
      name,
      sportType,
      location,
      pricePerHour: Number(pricePerHour),
      imageUrl: defaultImages[sportType] || defaultImages.Futsal
    };

    onAddSuccess(newVenue);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">➕ Add New Sports Venue</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold px-2">&times;</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Venue Name</label>
            <input 
              type="text" 
              placeholder="e.g., Elite Futsal Arena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sport Type</label>
            <select 
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Futsal">Futsal</option>
              <option value="Badminton">Badminton</option>
              <option value="Basketball">Basketball</option>
              <option value="Tennis">Tennis</option>
              <option value="Swimming">Swimming</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
            <input 
              type="text" 
              placeholder="e.g., Lalitpur, Nepal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price Per Hour (Rs.)</label>
            <input 
              type="number" 
              placeholder="e.g., 1200"
              value={pricePerHour}
              onChange={(e) => setPricePerHour(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 border-t pt-4 border-gray-100 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm shadow-sm"
            >
              Add Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}