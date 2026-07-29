const API_BASE = "http://127.0.0.1:5001/api";

export class Trip {
  constructor(data) {
    this.trip_name = data.trip_name;
    this.destination = data.destination;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.origin = data.origin;
    this.mode_of_transport = data.mode_of_transport;
    this.number_of_travelers = data.number_of_travelers || 1;
    this.traveler_details = data.traveler_details || [];
    this.total_estimated_cost = data.total_estimated_cost || 0;
    this.actual_cost = data.actual_cost || 0;
    this.mood = data.mood || 'adventure';
    this.status = data.status || 'planned';
    this.places_to_visit = data.places_to_visit || [];
    this.notes = data.notes || '';
    this.id = data.id || Date.now().toString();
  }

  static async list() {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const userStr = localStorage.getItem('tripPlannerUser');
      if (!userStr) return [];
      const user = JSON.parse(userStr);
      const allTrips = JSON.parse(localStorage.getItem('tripPlannerTripsDb') || '[]');
      const userTrips = allTrips.filter(t => t.username === user.username);
      return userTrips.map(item => new Trip(item)).reverse();
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  }

  static async create(data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const userStr = localStorage.getItem('tripPlannerUser');
      if (!userStr) throw new Error("Must be logged in to create a trip");
      const user = JSON.parse(userStr);
      
      const allTrips = JSON.parse(localStorage.getItem('tripPlannerTripsDb') || '[]');
      const newTrip = { ...data, id: Date.now().toString(), username: user.username };
      allTrips.push(newTrip);
      
      localStorage.setItem('tripPlannerTripsDb', JSON.stringify(allTrips));
      return new Trip(newTrip);
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const allTrips = JSON.parse(localStorage.getItem('tripPlannerTripsDb') || '[]');
      const index = allTrips.findIndex(t => t.id === id);
      
      if (index === -1) throw new Error("Trip not found");
      
      const updatedTrip = { ...allTrips[index], ...data, id };
      allTrips[index] = updatedTrip;
      
      localStorage.setItem('tripPlannerTripsDb', JSON.stringify(allTrips));
      return new Trip(updatedTrip);
    } catch (error) {
      console.error(`Error updating trip ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      let allTrips = JSON.parse(localStorage.getItem('tripPlannerTripsDb') || '[]');
      allTrips = allTrips.filter(t => t.id !== id);
      
      localStorage.setItem('tripPlannerTripsDb', JSON.stringify(allTrips));
      return { success: true };
    } catch (error) {
      console.error(`Error deleting trip ${id}:`, error);
      throw error;
    }
  }

  static async findById(id) {
    const trips = await this.list();
    return trips.find(trip => trip.id === id) || null;
  }
}

// Helper function to safely stringify requests
function jsonSafeStringify(obj) {
  return JSON.stringify(obj, (key, value) => {
    // Avoid double serialization issues or circular references
    return value;
  });
}