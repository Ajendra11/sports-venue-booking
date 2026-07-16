import React, { useState, useEffect } from 'react';

export default function EditVenueModal({ venue, onClose, onEditSuccess }) {
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState('');
  const [location, setLocation] = useState('');
  const [pricePerHour, setPricePerHour] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // Pre-fill the form with the venue's existing data when modal opens
  useEffect(() => {
    if (venue) {
      setName(venue.name || '');
      setSportType(venue.sportType || '');
      setLocation(venue.location || '');
      setPricePerHour(venue.pricePerHour || '');
      setImageUrl(venue.imageUrl || '');
    }
  }, [venue]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !sportType || !location || !pricePerHour) {
      alert("Please fill out all required fields.");
      return;
    }

    const updatedVenue = {
      name,
      sportType,
      location,
      pricePerHour: Number(pricePerHour),
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1517649763962-0c623066013b',
      availability: true
    };

    onEditSuccess(venue._id || venue.id, updatedVenue);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 className="font-bold text-lg">✏️ Edit Venue Facility</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold">×</button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Venue Name</label>
            <input 
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Sport Type</label>
              <input 
                type="text"
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                placeholder="e.g., Cricket, Futsal"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Price per Hour (Rs.)</label>
              <input 
                type="number"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Location</label>
            <input 
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Image URL</label>
            <input 
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Form Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}