import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TravelStatsProvider } from './contexts/TravelStatsContext.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import Layout from './pages/layout.jsx';
import MoodDashboard from './pages/mooddashboard.jsx';
import ExplorePlaces from './pages/Exploreplaces.jsx';
import PlanTrip from './pages/plantrip.jsx';
import TravelHistory from './pages/Travelhistory.jsx';
import Profile from './pages/Profile.jsx';
import PlaceDetails from './pages/Placedetails.jsx';
import AIChatAssistant from './pages/aichatassistant.jsx';
import Login from './pages/Login.jsx';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function App() {
  return (
    <AuthProvider>
      <TravelStatsProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Layout><MoodDashboard /></Layout></ProtectedRoute>} />
            <Route path="/mood-dashboard" element={<ProtectedRoute><Layout><MoodDashboard /></Layout></ProtectedRoute>} />
            <Route path="/explore-places" element={<ProtectedRoute><Layout><ExplorePlaces /></Layout></ProtectedRoute>} />
            <Route path="/plan-trip" element={<ProtectedRoute><Layout><PlanTrip /></Layout></ProtectedRoute>} />
            <Route path="/travel-history" element={<ProtectedRoute><Layout><TravelHistory /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/place-details" element={<ProtectedRoute><Layout><PlaceDetails /></Layout></ProtectedRoute>} />
            <Route path="/ai-chat-assistant" element={<ProtectedRoute><Layout><AIChatAssistant /></Layout></ProtectedRoute>} />
          </Routes>
        </Router>
      </TravelStatsProvider>
    </AuthProvider>
  );
}

export default App;
