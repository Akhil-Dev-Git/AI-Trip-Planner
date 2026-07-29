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
      if (!stored) throw new Error("Not logged in");
      const user = JSON.parse(stored);
      
      const usersDb = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
      const userProfile = usersDb.find(u => u.username === user.username) || {};
      
      return new User({ ...userProfile, full_name: userProfile.full_name || user.username });
    } catch (error) {
      console.error("Error loading user profile:", error);
      return new User();
    }
  }

  static async updateMyUserData(profileData) {
    try {
      const stored = localStorage.getItem('tripPlannerUser');
      if (!stored) throw new Error("Not logged in");
      const user = JSON.parse(stored);
      
      const usersDb = JSON.parse(localStorage.getItem('tripPlannerUsersDb') || '[]');
      const index = usersDb.findIndex(u => u.username === user.username);
      
      if (index > -1) {
        usersDb[index] = { ...usersDb[index], ...profileData };
        localStorage.setItem('tripPlannerUsersDb', JSON.stringify(usersDb));
        return new User(usersDb[index]);
      }
      throw new Error("User not found in DB");
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async current() {
    return this.me();
  }
}
