import React from "react";

export default function VenueCard({ venue }) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-full">

      {/* Image Section */}
      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
        <img
          src={venue.imageUrl}
          alt={venue.name}
          className="w-full h-full object-cover"
        />

        <span className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm">
          {venue.sportType}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
            {venue.name}
          </h3>

          <p className="text-sm text-gray-500 flex items-center mb-4">
            <span className="mr-1">📍</span>
            {venue.location}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-lg font-extrabold text-blue-600">
            Rs. {venue.pricePerHour}
            <span className="text-xs font-normal text-gray-500"> / hr</span>
          </span>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
            View Details
          </button>
        </div>
      </div>

    </div>
  );
}