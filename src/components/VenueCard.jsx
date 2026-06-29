import React from 'react';

export default function VenueCard({ venue }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <img 
        src={venue.imageUrl} 
        alt={venue.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-5">
        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wide">
          {venue.sportType}
        </span>
        <h3 className="mt-2 text-xl font-bold text-gray-900">{venue.name}</h3>
        <p className="mt-1 text-gray-600 text-sm flex items-center">
          📍 {venue.location}
        </p>
        <div className="mt-4 flex items-center justify-between border-t pt-4 border-gray-100">
          <span className="text-2xl font-extrabold text-blue-600">${venue.pricePerHour}<span className="text-sm font-normal text-gray-500">/hr</span></span>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}