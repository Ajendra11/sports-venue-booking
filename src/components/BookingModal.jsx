import React, { useState } from 'react';

export default function BookingModal({ venue, onClose, onBookSuccess }) {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(1); // Default to 1 hour

  // Calculate the total dynamic cost
  const totalCost = venue.pricePerHour * duration;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime) {
      alert("Please select both a date and start time!");
      return;
    }

    // Pass the completed booking object back up to App.jsx
    onBookSuccess({
      venueId: venue.id,
      venueName: venue.name,
      date,
      startTime,
      duration,
      totalCost
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-lg">Book {venue.name}</h3>
            <p className="text-xs text-blue-100">Rate: Rs. {venue.pricePerHour} / hour</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 text-xl font-bold px-2">&times;</button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Select Date</label>
            <input 
              type="date" 
              value={date}
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Start Time</label>
              <input 
                type="time" 
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Duration (Hours)</label>
              <select 
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {[1, 2, 3, 4, 5].map(hr => (
                  <option key={hr} value={hr}>{hr} {hr === 1 ? 'Hour' : 'Hours'}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Dynamic Cost Calculator Panel */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex justify-between items-center mt-2">
            <span className="text-sm font-medium text-blue-800">Total Estimation:</span>
            <span className="text-xl font-black text-blue-600">Rs. {totalCost}</span>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 border-t pt-4 border-gray-100 mt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 text-sm transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 text-sm transition-colors shadow-sm"
            >
              Confirm Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}