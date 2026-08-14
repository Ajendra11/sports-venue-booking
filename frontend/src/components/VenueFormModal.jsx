import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import Modal from './ui/Modal.jsx';
import { DEFAULT_SPORT_IMAGES, SPORT_OPTIONS } from '../utils/images.js';

/**
 * One form used for both creating and editing a venue — previously two
 * near-identical modals that had drifted apart in styling and fields.
 */
export default function VenueFormModal({ venue, onClose, onSubmit }) {
  const isEditing = Boolean(venue);

  const [name, setName] = useState(venue?.name ?? '');
  const [sportType, setSportType] = useState(venue?.sportType ?? 'Futsal');
  const [location, setLocation] = useState(venue?.location ?? '');
  const [pricePerHour, setPricePerHour] = useState(venue?.pricePerHour ?? '');
  const [imageUrl, setImageUrl] = useState(venue?.imageUrl ?? '');
  const [facilities, setFacilities] = useState(venue?.facilities ?? []);
  const [facilityDraft, setFacilityDraft] = useState('');

  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addFacility = () => {
    const value = facilityDraft.trim();
    if (!value || facilities.includes(value)) {
      setFacilityDraft('');
      return;
    }
    setFacilities([...facilities, value]);
    setFacilityDraft('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !location.trim() || !String(pricePerHour).trim()) {
      setError('Name, location and price per hour are all required.');
      return;
    }

    if (Number(pricePerHour) < 0 || Number.isNaN(Number(pricePerHour))) {
      setError('Price per hour must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        sportType,
        location: location.trim(),
        pricePerHour: Number(pricePerHour),
        facilities,
        imageUrl: imageUrl.trim() || DEFAULT_SPORT_IMAGES[sportType] || DEFAULT_SPORT_IMAGES.Futsal,
        availability: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEditing ? 'Edit venue' : 'Add a new venue'}
      subtitle={isEditing ? venue.name : 'List a court or facility for booking'}
      onClose={onClose}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-5">
        <div className="space-y-4">
          <div>
            <label htmlFor="venue-name" className="form-label">Venue name *</label>
            <input
              id="venue-name"
              type="text"
              placeholder="e.g. Elite Futsal Arena"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="venue-sport" className="form-label">Sport type *</label>
              <select
                id="venue-sport"
                value={sportType}
                onChange={(e) => setSportType(e.target.value)}
                className="form-input"
              >
                {SPORT_OPTIONS.map((sport) => <option key={sport} value={sport}>{sport}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="venue-price" className="form-label">Price per hour (Rs.) *</label>
              <input
                id="venue-price"
                type="number"
                min="0"
                placeholder="e.g. 1200"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="venue-location" className="form-label">Location *</label>
            <input
              id="venue-location"
              type="text"
              placeholder="e.g. Lalitpur, Nepal"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
            />
          </div>

          <div>
            <label htmlFor="venue-facility" className="form-label">Facilities</label>
            <div className="flex gap-2">
              <input
                id="venue-facility"
                type="text"
                placeholder="e.g. Floodlights"
                value={facilityDraft}
                onChange={(e) => setFacilityDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addFacility(); }
                }}
                className="form-input"
              />
              <button type="button" onClick={addFacility} className="btn-secondary shrink-0">Add</button>
            </div>
            {facilities.length > 0 && (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {facilities.map((facility) => (
                  <li key={facility} className="chip">
                    {facility}
                    <button
                      type="button"
                      onClick={() => setFacilities(facilities.filter((f) => f !== facility))}
                      className="ml-0.5 rounded-full p-0.5 text-ink-400 hover:bg-ink-200 hover:text-ink-700"
                      aria-label={`Remove ${facility}`}
                    >
                      <X size={11} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <label htmlFor="venue-image" className="form-label">Image URL (optional)</label>
            <input
              id="venue-image"
              type="url"
              placeholder="Leave blank to use a default sport image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        {error && <div className="form-error mt-4">{error}</div>}

        <div className="mt-5 flex gap-3 border-t border-ink-100 pt-5">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
            {isSubmitting ? 'Saving…' : isEditing ? 'Save changes' : 'Add venue'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
