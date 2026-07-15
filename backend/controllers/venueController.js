import {
  getAllVenues,
  getVenueById as modelGetVenueById,
  addVenue as modelAddVenue,
} from "../models/venueModel.js";

function getVenues(req, res) {
  try {
    const venues = getAllVenues();
    return res.json(venues);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function getVenueById(req, res) {
  const { id } = req.params;
  try {
    const venue = modelGetVenueById(Number(id));
    if (!venue) {
      return res.status(404).json({ error: "Venue not found" });
    }
    return res.json(venue);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

function addVenue(req, res) {
  const newVenue = req.body;
  try {
    const addedVenue = modelAddVenue(newVenue);
    return res.status(201).json(addedVenue);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

export { getVenues, getVenueById, addVenue };

