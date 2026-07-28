export const createPageUrl = (pageName) => {
  const urlMap = {
    'MoodDashboard': '/mood-dashboard',
    'ExplorePlaces': '/explore-places',
    'PlanTrip': '/plan-trip',
    'TravelHistory': '/travel-history',
    'Profile': '/profile',
    'PlaceDetails': '/place-details',
    'AIChatAssistant': '/ai-chat-assistant'
  };
  return urlMap[pageName] || '/';
};
