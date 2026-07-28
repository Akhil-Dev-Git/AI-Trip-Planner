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
      const response = await fetch(`${API_BASE}/trips`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(item => new Trip(item));
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  }

  static async create(data) {
    try {
      const response = await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonSafeStringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const savedData = await response.json();
      return new Trip(savedData);
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: jsonSafeStringify(data)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const updatedData = await response.json();
      return new Trip(updatedData);
    } catch (error) {
      console.error(`Error updating trip ${id}:`, error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const response = await fetch(`${API_BASE}/trips/${id}`, {
        method: "DELETE"
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
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