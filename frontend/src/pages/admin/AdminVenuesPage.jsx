import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Search, Building2, ExternalLink } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../components/ui/ToastProvider.jsx';
import { getVenues, createVenue, updateVenue, deleteVenue } from '../../api/venueApi.js';
import { EmptyState, ErrorState } from '../../components/ui/States.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import VenueFormModal from '../../components/VenueFormModal.jsx';
import { FALLBACK_VENUE_IMAGE } from '../../utils/images.js';

export default function AdminVenuesPage() {
  const { token } = useAuth();
  const toast = useToast();

  const [venues, setVenues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [venueToEdit, setVenueToEdit] = useState(null);
  const [venueToDelete, setVenueToDelete] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setVenues(await getVenues());
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return venues;
    return venues.filter((v) =>
      [v.name, v.location, v.sportType].filter(Boolean).some((s) => s.toLowerCase().includes(q))
    );
  }, [venues, search]);

  const handleSubmit = async (venueData) => {
    if (venueToEdit) {
      const updated = await updateVenue(token, venueToEdit._id, venueData);
      setVenues((cur) => cur.map((v) => (v._id === updated._id ? updated : v)));
      toast.success(`"${updated.name}" updated.`);
    } else {
      const created = await createVenue(token, venueData);
      setVenues((cur) => [created, ...cur]);
      toast.success(`"${created.name}" added to the catalogue.`);
    }
    setIsFormOpen(false);
    setVenueToEdit(null);
  };

  const handleDelete = async () => {
    const venue = venueToDelete;
    try {
      await deleteVenue(token, venue._id);
      setVenues((cur) => cur.filter((v) => v._id !== venue._id));
      toast.success(`"${venue.name}" deleted.`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setVenueToDelete(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, location or sport…"
            className="form-input pl-10"
            aria-label="Search venues"
          />
        </div>
        <button
          onClick={() => { setVenueToEdit(null); setIsFormOpen(true); }}
          className="btn-primary shrink-0"
        >
          <Plus size={16} aria-hidden="true" />
          Add venue
        </button>
      </div>

      {isLoading ? (
        <div className="card p-5" aria-busy="true">
          {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton mb-3 h-14" />)}
        </div>
      ) : error ? (
        <ErrorState title="Couldn't load venues" message={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={search ? 'No venues match your search' : 'No venues yet'}
          description={search ? 'Try a different term.' : 'Add your first venue to get the catalogue started.'}
          action={
            search
              ? <button onClick={() => setSearch('')} className="btn-secondary">Clear search</button>
              : <button onClick={() => setIsFormOpen(true)} className="btn-primary">Add venue</button>
          }
        />
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-200 bg-ink-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Venue</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Sport</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Location</th>
                  <th scope="col" className="px-4 py-3 text-right text-label uppercase text-ink-400">Rate/hr</th>
                  <th scope="col" className="px-4 py-3 text-label uppercase text-ink-400">Facilities</th>
                  <th scope="col" className="px-4 py-3 text-right text-label uppercase text-ink-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {filtered.map((venue) => (
                  <tr key={venue._id} className="transition-colors hover:bg-ink-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={venue.imageUrl || FALLBACK_VENUE_IMAGE}
                          alt=""
                          onError={(e) => { e.currentTarget.src = FALLBACK_VENUE_IMAGE; }}
                          className="h-10 w-14 shrink-0 rounded-lg object-cover"
                        />
                        <Link to={`/venues/${venue._id}`} className="font-semibold text-ink-900 hover:text-brand-700">
                          {venue.name}
                          <ExternalLink size={11} className="ml-1 inline text-ink-400" aria-hidden="true" />
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3"><span className="chip">{venue.sportType}</span></td>
                    <td className="px-4 py-3 text-ink-600">{venue.location}</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-brand-700">
                      Rs. {venue.pricePerHour.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs text-ink-500">
                      {venue.facilities?.length ? `${venue.facilities.length} listed` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => { setVenueToEdit(venue); setIsFormOpen(true); }}
                          className="btn-secondary btn-sm !px-2.5"
                          aria-label={`Edit ${venue.name}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setVenueToDelete(venue)}
                          className="btn-danger btn-sm !px-2.5"
                          aria-label={`Delete ${venue.name}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-ink-100 md:hidden">
            {filtered.map((venue) => (
              <li key={venue._id} className="p-4">
                <div className="flex items-start gap-3">
                  <img
                    src={venue.imageUrl || FALLBACK_VENUE_IMAGE}
                    alt=""
                    onError={(e) => { e.currentTarget.src = FALLBACK_VENUE_IMAGE; }}
                    className="h-12 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{venue.name}</p>
                    <p className="mt-0.5 truncate text-xs text-ink-500">{venue.location}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="chip">{venue.sportType}</span>
                      <span className="text-sm font-bold text-brand-700">
                        Rs. {venue.pricePerHour.toLocaleString()}/hr
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => { setVenueToEdit(venue); setIsFormOpen(true); }}
                    className="btn-secondary btn-sm flex-1"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button onClick={() => setVenueToDelete(venue)} className="btn-danger btn-sm flex-1">
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-ink-100 bg-ink-50/60 px-4 py-2.5 text-xs text-ink-500">
            {filtered.length} of {venues.length} venue{venues.length === 1 ? '' : 's'}
          </div>
        </div>
      )}

      {isFormOpen && (
        <VenueFormModal
          venue={venueToEdit}
          onClose={() => { setIsFormOpen(false); setVenueToEdit(null); }}
          onSubmit={handleSubmit}
        />
      )}

      {venueToDelete && (
        <ConfirmDialog
          title="Delete this venue?"
          message={`"${venueToDelete.name}" and all of its bookings will be permanently removed. This cannot be undone.`}
          confirmLabel="Delete venue"
          onConfirm={handleDelete}
          onClose={() => setVenueToDelete(null)}
        />
      )}
    </div>
  );
}
