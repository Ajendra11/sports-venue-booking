import { SearchX } from 'lucide-react';
import VenueCard from './VenueCard.jsx';
import { VenueGridSkeleton, EmptyState, ErrorState } from './ui/States.jsx';

/**
 * Renders the venue grid together with its loading, empty and error states.
 */
export default function VenueList({
  venues,
  isLoading,
  error,
  onRetry,
  onBookClick,
  onClearFilters,
  hasFilters = false,
}) {
  if (isLoading) return <VenueGridSkeleton />;

  if (error) {
    return (
      <ErrorState
        title="Couldn't load venues"
        message={error}
        onRetry={onRetry}
      />
    );
  }

  if (venues.length === 0) {
    return (
      <EmptyState
        icon={SearchX}
        title={hasFilters ? 'No venues match your search' : 'No venues yet'}
        description={
          hasFilters
            ? 'Try a different name, location, or sport filter to widen your results.'
            : 'Once venues are added to the catalogue they will appear here.'
        }
        action={
          hasFilters && onClearFilters ? (
            <button onClick={onClearFilters} className="btn-secondary">Clear filters</button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {venues.map((venue, index) => (
        <div
          key={venue._id || venue.id}
          className="flex animate-fade-up"
          // Subtle stagger so the grid resolves rather than snapping in
          style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
        >
          <VenueCard venue={venue} onBookClick={onBookClick} />
        </div>
      ))}
    </div>
  );
}
