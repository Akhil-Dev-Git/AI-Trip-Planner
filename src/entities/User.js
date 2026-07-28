const API_BASE = "http://127.0.0.1:5001/api";

export class User {
  constructor(data) {
    this.id = data?.id || 'me';
    this.full_name = data?.full_name || 'Travel Explorer';
    this.email = data?.email || 'explorer@example.com';
    this.bio = data?.bio || '';
    this.location = data?.location || '';
    this.preferred_mood = data?.preferred_mood || '';
    this.travel_budget = data?.travel_budget || '';
    this.travel_style = data?.travel_style || '';
    this.languages = data?.languages || [];
    this.interests = data?.interests || [];
    this.avatar_url = data?.avatar_url || '';
    this.created_date = data?.created_date || '2026';
  }

  static async me() {
    try {
      const stored = localStorage.getItem('tripPlannerUser');
      const token = stored ? JSON.parse(stored).token : '';
      
      const response = await fetch(`${API_BASE}/user/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error("Error loading user profile:", error);
      return new User();
    }
  }

  static async updateMyUserData(profileData) {
    try {
      const stored = localStorage.getItem('tripPlannerUser');
      const token = stored ? JSON.parse(stored).token : '';
      
      const response = await fetch(`${API_BASE}/user/me`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return new User(data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async current() {
    return this.me();
  }
}
