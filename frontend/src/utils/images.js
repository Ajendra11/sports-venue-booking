/** Shown when a venue has no image, or its image URL fails to load. */
export const FALLBACK_VENUE_IMAGE =
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&auto=format&fit=crop&q=60';

/** Per-sport placeholder used when a venue is created without an image URL. */
export const DEFAULT_SPORT_IMAGES = {
  Futsal: 'https://images.unsplash.com/photo-1577223625856-745524fb08bc?w=800&auto=format&fit=crop&q=60',
  Badminton: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&auto=format&fit=crop&q=60',
  Basketball: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=60',
  Tennis: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&auto=format&fit=crop&q=60',
  Swimming: 'https://images.unsplash.com/photo-1519666336592-e225a99dbe2f?w=800&auto=format&fit=crop&q=60',
  Cricket: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&auto=format&fit=crop&q=60',
  Volleyball: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&auto=format&fit=crop&q=60',
};

/** Sports offered in the venue form's dropdown. */
export const SPORT_OPTIONS = Object.keys(DEFAULT_SPORT_IMAGES);
