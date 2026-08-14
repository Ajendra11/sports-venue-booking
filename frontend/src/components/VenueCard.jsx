import { Link } from 'react-router-dom';
import { MapPin, CalendarPlus } from 'lucide-react';
import { FALLBACK_VENUE_IMAGE } from '../utils/images.js';

export default function VenueCard({ venue, onBookClick }) {
  const venueId = venue._id || venue.id;
  const facilities = venue.facilities || [];

  return (
    <article className="card-interactive group flex h-full w-full flex-col overflow-hidden">
      {/* Image */}
      <Link to={`/venues/${venueId}`} className="relative block h-48 overflow-hidden bg-ink-100">
        <img
          src={venue.imageUrl || FALLBACK_VENUE_IMAGE}
          alt={venue.name}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = FALLBACK_VENUE_IMAGE; }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900/45 via-transparent to-transparent" />
        <span className="badge-brand absolute right-3 top-3">{venue.sportType}</span>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <Link to={`/venues/${venueId}`} className="min-w-0">
          <h3 className="truncate text-heading text-ink-900 transition-colors group-hover:text-brand-700">
            {venue.name}
          </h3>
        </Link>

        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
          <MapPin size={14} className="shrink-0 text-ink-400" aria-hidden="true" />
          <span className="truncate">{venue.location}</span>
        </p>

        {facilities.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {facilities.slice(0, 3).map((facility) => (
              <li key={facility} className="chip">{facility}</li>
            ))}
            {facilities.length > 3 && (
              <li className="chip">+{facilities.length - 3} more</li>
            )}
          </ul>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-ink-100 pt-4">
          <p className="whitespace-nowrap">
            <span className="text-xl font-extrabold tracking-tight text-brand-700">
              Rs. {venue.pricePerHour.toLocaleString()}
            </span>
            <span className="text-xs font-medium text-ink-400"> / hr</span>
          </p>

          <button onClick={() => onBookClick(venue)} className="btn-primary btn-sm">
            <CalendarPlus size={15} aria-hidden="true" />
            Book
          </button>
        </div>
      </div>
    </article>
  );
}
