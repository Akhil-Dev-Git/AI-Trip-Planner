const API_BASE = "http://127.0.0.1:5001/api";

export class Place {
  constructor(data) {
    this.name = data.name;
    this.location = data.location;
    this.region = data.region;
    this.mood = data.mood;
    this.description = data.description || '';
    this.image_url = data.image_url || '';
    this.latitude = data.latitude || 0;
    this.longitude = data.longitude || 0;
    this.estimated_cost_per_day = data.estimated_cost_per_day || 0;
    this.best_time_to_visit = data.best_time_to_visit || '';
    this.duration_days = data.duration_days || 1;
    this.nearby_hotels = data.nearby_hotels || [];
    this.nearby_restaurants = data.nearby_restaurants || [];
    this.transportation_options = data.transportation_options || [];
    this.activities = data.activities || [];
    this.id = data.id || Date.now().toString();
  }

  static async list() {
    try {
      const response = await fetch(`${API_BASE}/places`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.map(item => new Place(item));
    } catch (error) {
      console.error("Error fetching places:", error);
      return [];
    }
  }

  static async findById(id) {
    try {
      const response = await fetch(`${API_BASE}/places/${id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return new Place(data);
    } catch (error) {
      console.error(`Error fetching place with ID ${id}:`, error);
      return null;
    }
  }
}