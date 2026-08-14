import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Loader2, MapPin, Clock, AlertTriangle, RotateCcw } from 'lucide-react';
import { getRecommendations } from '../api/aiApi.js';
import { todayLocal } from '../utils/date.js';

const today = todayLocal;

/** Rank medal colours for the top-3 ordering. */
const RANK_STYLES = [
  'bg-amber-100 text-amber-800 border-amber-200',
  'bg-ink-100 text-ink-700 border-ink-200',
  'bg-orange-100 text-orange-800 border-orange-200',
];

export default function AiRecommendPanel({ sportsTypes = [], onBookClick }) {
  const [sportType, setSportType] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(today());

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await getRecommendations({
        sportType: sportType || undefined,
        budget: budget ? Number(budget) : undefined,
        location: location || undefined,
        date: date || undefined,
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setSportType('');
    setBudget('');
    setLocation('');
  };

  return (
    <section className="card overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200/70 bg-gradient-to-r from-brand-700 to-brand-500 px-5 py-4 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-heading">AI Venue Recommender</h2>
            <p className="text-xs text-brand-100">Tell us what you need — we'll rank the best three matches</p>
          </div>
        </div>
        {result && (
          <button onClick={handleReset} className="btn btn-sm bg-white/15 text-white hover:bg-white/25">
            <RotateCcw size={14} aria-hidden="true" />
            Start over
          </button>
        )}
      </div>

      {/* Preferences form */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label htmlFor="ai-sport" className="form-label">Sport</label>
          <select
            id="ai-sport"
            value={sportType}
            onChange={(e) => setSportType(e.target.value)}
            className="form-input"
          >
            <option value="">Any sport</option>
            {sportsTypes.filter((s) => s !== 'All').map((sport) => (
              <option key={sport} value={sport}>{sport}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ai-budget" className="form-label">Budget (Rs/hr)</label>
          <input
            id="ai-budget"
            type="number"
            min="0"
            placeholder="e.g. 3000"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="ai-location" className="form-label">Preferred area</label>
          <input
            id="ai-location"
            type="text"
            placeholder="e.g. Chabahil"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="form-input"
          />
        </div>

        <div>
          <label htmlFor="ai-date" className="form-label">Playing on</label>
          <input
            id="ai-date"
            type="date"
            min={today()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" disabled={isLoading} className="btn-primary w-full sm:w-auto">
            {isLoading
              ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> Analysing venues…</>
              : <><Sparkles size={16} aria-hidden="true" /> Get AI Recommendation</>}
          </button>
        </div>
      </form>

      {/* Results */}
      {(isLoading || error || result) && (
        <div className="border-t border-ink-200/70 bg-ink-50/60 p-5">
          {isLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3" aria-busy="true">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton mb-3 h-24 w-full" />
                  <div className="skeleton mb-2 h-5 w-2/3" />
                  <div className="skeleton mb-2 h-3 w-full" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
              ))}
            </div>
          )}

          {error && !isLoading && (
            <div className="form-error flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2">
                <AlertTriangle size={16} aria-hidden="true" />
                {error}
              </span>
              <button onClick={handleSubmit} className="btn-secondary btn-sm">Try again</button>
            </div>
          )}

          {result && !isLoading && (
            <>
              {result.summary && (
                <p className="mb-4 text-sm leading-relaxed text-ink-600">{result.summary}</p>
              )}

              {result.recommendations.length === 0 ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-5 text-center">
                  <p className="text-sm font-semibold text-amber-800">No strong matches found</p>
                  <p className="mt-1 text-xs text-amber-700">Try widening your budget or choosing another area.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {result.recommendations.map((rec, index) => {
                    const venue = rec.venue;
                    const venueId = venue._id || venue.id;
                    return (
                      <article
                        key={venueId}
                        className="card-interactive flex flex-col overflow-hidden animate-fade-up"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <div className="relative h-28 overflow-hidden bg-ink-100">
                          {venue.imageUrl && (
                            <img src={venue.imageUrl} alt={venue.name} loading="lazy" className="h-full w-full object-cover" />
                          )}
                          <span className={`absolute left-3 top-3 rounded-full border px-2 py-0.5 text-xs font-bold ${RANK_STYLES[index] ?? RANK_STYLES[1]}`}>
                            #{index + 1}
                          </span>
                          {rec.matchScore > 0 && (
                            <span className="absolute right-3 top-3 rounded-full bg-ink-900/70 px-2 py-0.5 text-xs font-semibold text-white">
                              {rec.matchScore}% match
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-4">
                          <Link to={`/venues/${venueId}`}>
                            <h3 className="truncate font-bold text-ink-900 hover:text-brand-700">{venue.name}</h3>
                          </Link>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
                            <MapPin size={12} className="shrink-0" aria-hidden="true" />
                            <span className="truncate">{venue.location}</span>
                            <span className="text-ink-300">·</span>
                            <span className="font-semibold text-brand-700">Rs. {venue.pricePerHour.toLocaleString()}/hr</span>
                          </p>

                          <p className="mt-2.5 text-sm leading-relaxed text-ink-600">{rec.reason}</p>

                          {rec.bestSlots?.length > 0 && (
                            <p className="mt-3 flex flex-wrap items-center gap-1.5 text-xs text-ink-500">
                              <Clock size={12} className="shrink-0" aria-hidden="true" />
                              {rec.bestSlots.map((slot) => (
                                <span key={slot} className="chip !px-2 !py-0.5">{slot}</span>
                              ))}
                            </p>
                          )}

                          <button onClick={() => onBookClick(venue)} className="btn-primary btn-sm mt-4 w-full">
                            Book this venue
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
