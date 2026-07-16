import Venue from '../models/venueModel.js';

// Fetch all venues from MongoDB Atlas
export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find({});
    res.status(200).json(venues);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving venues from database', error: error.message });
  }
};

// Find a single venue document by ID
export const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({ message: 'Venue not found' });
    }
    res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: 'Error locating venue record', error: error.message });
  }
};

// Save a brand new venue document down into the collection
export const addVenue = async (req, res) => {
  try {
    const { name, sportType, location, pricePerHour, imageUrl, availability } = req.body;
    
    const newVenue = new Venue({
      name,
      sportType,
      location,
      pricePerHour,
      imageUrl,
      availability
    });

    const savedVenue = await newVenue.save();
    res.status(201).json(savedVenue);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create venue record', error: error.message });
  }
};
// PUT / update venue
export const updateVenue = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await Venue.findByIdAndUpdate(
      id, 
      req.body, 
      { new: true, runValidators: true } // Returns the newly updated document
    );
    
    if (!updated) {
      return res.status(404).json({ error: "Venue not found" });
    }
    
    return res.json(updated);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};