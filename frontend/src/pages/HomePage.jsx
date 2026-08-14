import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import VenueList from '../components/VenueList.jsx';
import AiRecommendPanel from '../components/AiRecommendPanel.jsx';

export default function HomePage({ venues, isLoading, error, onRetry, onBookClick }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('All');

  const sportsTypes = useMemo(
    () => ['All', ...new Set(venues.map((v) => v.sportType).filter(Boolean))],
    [venues]
  );

  const filteredVenues = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return venues.filter((venue) => {
      const matchesSearch =
        !query ||
        (venue.name || '').toLowerCase().includes(query) ||
        (venue.location || '').toLowerCase().includes(query);
      const matchesSport = selectedSport === 'All' || venue.sportType === selectedSport;
      return matchesSearch && matchesSport;
    });
  }, [venues, searchTerm, selectedSport]);

  const hasFilters = searchTerm.trim() !== '' || selectedSport !== 'All';

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSport('All');
  };

  return (
    <main className="page">
      {/* Hero */}
      <section className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-6 py-10 text-white shadow-card sm:px-10 sm:py-14">
        <h1 className="max-w-2xl text-display">Book your next game</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100 sm:text-base">
          Browse courts and pitches across the city, check live slot availability, and reserve
          in a couple of taps.
        </p>
      </section>

      {/* AI recommender */}
      <div className="mb-8">
        <AiRecommendPanel sportsTypes={sportsTypes} onBookClick={onBookClick} />
      </div>

      {/* Search & filter */}
      <section className="mb-6 grid grid-cols-1 gap-4 rounded-2xl border border-ink-200/70 bg-white p-4 shadow-card md:grid-cols-3">
        <div className="md:col-span-2">
          <label htmlFor="venue-search" className="form-label">Search facilities</label>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <input
              id="venue-search"
              type="search"
              placeholder="Search by name or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        <div>
          <label htmlFor="sport-filter" className="form-label">Sport type</label>
          <div className="relative">
            <SlidersHorizontal size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
            <select
              id="sport-filter"
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="form-input pl-10"
            >
              {sportsTypes.map((sport) => (
                <option key={sport} value={sport}>{sport === 'All' ? 'All sports' : sport}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Results header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-title text-ink-900">Available venues</h2>
        <div className="flex items-center gap-2">
          {hasFilters && (
            <button onClick={clearFilters} className="btn-ghost btn-sm">
              <X size={13} aria-hidden="true" />
              Clear filters
            </button>
          )}
          <span className="chip">
            {isLoading ? 'Loading…' : `${filteredVenues.length} result${filteredVenues.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </div>

      <VenueList
        venues={filteredVenues}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        onBookClick={onBookClick}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
    </main>
  );
}
