import React from "react";

export default function VenueCard({ venue, onBookClick, onDeleteClick, onEditClick }) {
  const venueId = venue._id || venue.id;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300 flex flex-col h-full w-full">

      {/* Image Section */}
      <div className="relative w-full h-56 overflow-hidden bg-gray-100">
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=500&auto=format&fit=crop&q=60"}
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

        <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4 gap-2">
          <span className="text-lg font-extrabold text-blue-600 whitespace-nowrap">
            Rs. {venue.pricePerHour}
            <span className="text-xs font-normal text-gray-500"> / hr</span>
          </span>

          <div className="flex items-center gap-1.5">
            {/* ✏️ Edit Button */}
            <button 
              onClick={() => onEditClick(venue)}
              className="p-2 bg-gray-50 hover:bg-gray-150 text-gray-600 rounded-lg transition-colors border border-gray-200"
              title="Edit Venue"
            >
             EDIT
            </button>

            {/* 🗑️ Delete Button */}
            <button 
              onClick={() => onDeleteClick(venueId)}
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-200"
              title="Delete Venue"
            >
              DELETE
            </button>

            {/* Book Now Button */}
            <button 
              onClick={() => onBookClick(venue)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm whitespace-nowrap"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}