import { sampleVenues } from '../data/venues.js'


function getAllVenues() {
  return sampleVenues
}

function updateVenue(id, updatedVenue) {
  const index = sampleVenues.findIndex(venue => venue.id === id)
  if (index === -1) {
    throw new Error('Venue not found')
  }
  
  sampleVenues[index] = { ...sampleVenues[index], ...updatedVenue }
  return sampleVenues[index]
}

function deleteVenue(id) {
  const index = sampleVenues.findIndex(venue => venue.id === id)
  if (index === -1) {
    throw new Error('Venue not found')
  }
  
  const deletedVenue = sampleVenues.splice(index, 1)
  return deletedVenue[0]
}                   
function getVenueById(id) {
  return sampleVenues.find(venue => venue.id === id)
}

function addVenue(newVenue) {
  if (!newVenue.name || !newVenue.sportType || !newVenue.location || !newVenue.pricePerHour) {
    throw new Error('Missing required fields')
  }
  
  sampleVenues.push(newVenue)
  return newVenue
}

export { getAllVenues, getVenueById, addVenue }
