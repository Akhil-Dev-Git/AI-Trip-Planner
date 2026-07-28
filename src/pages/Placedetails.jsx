
import React, { useState, useEffect, useCallback } from "react";
import { Place } from "@/entities/place";
import { useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Calendar,
  Star,
  Hotel,
  Utensils,
  Car,
  Activity,
  Heart,
  Share,
  Navigation,
  Phone,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function PlaceDetails() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const placeId = urlParams.get("id");
  
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  const [directionsData, setDirectionsData] = useState(null);
  const [isDirectionsLoading, setIsDirectionsLoading] = useState(false);

  const handleGetDirections = async () => {
    setIsDirectionsOpen(true);
    setIsDirectionsLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5001/api/navigation/directions?destination_id=${place.id}&dest_lat=${place.latitude}&dest_lng=${place.longitude}`);
      if (response.ok) {
        const data = await response.json();
        setDirectionsData(data);
      }
    } catch (error) {
      console.error("Error fetching directions:", error);
    }
    setIsDirectionsLoading(false);
  };

  const loadPlace = useCallback(async () => {
    try {
      const placeData = await Place.findById(placeId); // More efficient: Fetch a single place by ID
      setPlace(placeData);
    } catch (error) {
      console.error("Error loading place:", error);
    }
    setIsLoading(false);
  }, [placeId]); // Dependency on placeId

  useEffect(() => {
    if (placeId) {
      loadPlace();
    }
  }, [placeId, loadPlace]); // Dependencies on placeId and loadPlace

  if (isLoading) {
    return (
      <div className="min-h-screen realistic-bg p-4 md:p-8">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="h-96 bg-gray-200 rounded-2xl mb-8" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen realistic-bg flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600">Place not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen realistic-bg">
      {/* Hero Section */}
      <div className="relative h-96 md:h-[500px] overflow-hidden">
        {place.image_url ? (
          <img 
            src={place.image_url} 
            alt={place.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-400 to-teal-500 flex items-center justify-center">
            <MapPin className="w-24 h-24 text-white/60" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        
        <div className="absolute top-6 left-6 flex items-center gap-4">
          <Link to={createPageUrl("ExplorePlaces")}>
            <Button size="icon" variant="secondary" className="bg-white/80 hover:bg-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="absolute top-6 right-6 flex items-center gap-2">
          <Button size="icon" variant="secondary" className="bg-white/80 hover:bg-white">
            <Heart className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className="bg-white/80 hover:bg-white">
            <Share className="w-4 h-4" />
          </Button>
        </div>

        <div className="absolute bottom-8 left-8 right-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-white/30 capitalize">
                {place.region?.replace('_', ' ')}
              </Badge>
              <Badge className={`border-0 ${place.region === 'international' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {place.region === 'international' ? 'International' : 'National'}
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 capitalize">
                {place.mood?.replace('_', ' ')}
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{place.name}</h1>
            <p className="text-lg flex items-center gap-2 opacity-90">
              <MapPin className="w-5 h-5" />
              {place.location}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto p-6 md:p-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {place.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <IndianRupee className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Per Day</p>
                    <p className="font-bold text-blue-600">₹{place.estimated_cost_per_day}</p>
                  </div>
                  <div className="text-center p-4 bg-teal-50 rounded-xl">
                    <Clock className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-bold text-teal-600">{place.duration_days} Days</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <Calendar className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Best Time</p>
                    <p className="font-bold text-purple-600 text-xs">{place.best_time_to_visit}</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-xl">
                    <Star className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Rating</p>
                    <p className="font-bold text-orange-600">{place.rating || "N/A"}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activities */}
            {place.activities && place.activities.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-600" />
                    Activities & Attractions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {place.activities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-gray-700">{activity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {place.transportation_options && place.transportation_options.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Transportation Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {place.transportation_options.map((transport, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {transport}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Link to={`${createPageUrl("PlanTrip")}?destination=${place.name}`} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                      Plan Your Trip
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full" onClick={handleGetDirections}>
                    <Navigation className="w-4 h-4 mr-2" />
                    Get Directions
                  </Button>
                  <Link to={`/ai-chat-assistant?place=${encodeURIComponent(place.name)}`} className="w-full">
                    <Button variant="outline" className="w-full text-blue-600 border-blue-200 hover:bg-blue-50/50">
                      <Sparkles className="w-4 h-4 mr-2 text-blue-500 animate-pulse" />
                      Ask AI Guide
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Nearby Hotels */}
            {place.nearby_hotels && place.nearby_hotels.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Hotel className="w-5 h-5 text-purple-600" />
                    Nearby Hotels
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {place.nearby_hotels.slice(0, 3).map((hotel, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{hotel.name}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{hotel.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        ₹{hotel.price_per_night}/night
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Nearby Restaurants */}
            {place.nearby_restaurants && place.nearby_restaurants.length > 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Utensils className="w-5 h-5 text-orange-600" />
                    Nearby Restaurants
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {place.nearby_restaurants.slice(0, 3).map((restaurant, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-1">{restaurant.name}</h4>
                      <p className="text-sm text-gray-600 mb-1">{restaurant.cuisine}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <IndianRupee className="w-3 h-3" />
                        ₹{restaurant.avg_cost_for_two} for two
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {isDirectionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-2xl bg-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <CardHeader className="border-b border-gray-150 p-6 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
                <Navigation className="w-5 h-5 text-blue-600" />
                Travel Navigation & Routing
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDirectionsOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </Button>
            </CardHeader>
            <CardContent className="p-6 overflow-auto space-y-6">
              {isDirectionsLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500">Calculating optimal route and travel stats...</p>
                </div>
              ) : directionsData ? (
                <div className="space-y-6">
                  {/* Route Summary */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-teal-500/10 rounded-xl p-4 border border-blue-100 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Route Distance</p>
                      <p className="text-2xl font-black text-blue-600">{directionsData.distance_km} km</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">From</p>
                      <p className="text-sm font-semibold text-gray-800 truncate max-w-[250px]">{directionsData.origin.name}</p>
                    </div>
                  </div>

                  {/* Multi-modal Comparison */}
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Transportation Modes</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {Object.entries(directionsData.modes).map(([key, mode]) => (
                        <div key={key} className="border border-gray-200 rounded-xl p-3 bg-slate-50 flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-gray-800 text-sm capitalize">{mode.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">Est. Time: {mode.duration_text}</p>
                          </div>
                          <div className="mt-3 pt-2 border-t border-gray-150">
                            <p className="text-xs text-gray-600 font-semibold">Cost: ₹{mode.estimated_cost}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">CO2: {mode.co2_emissions_kg} kg</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step-by-Step Directions */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Step-by-Step Route Guidance</h3>
                    <div className="relative border-l-2 border-blue-200 ml-3 pl-5 space-y-4 py-1">
                      {directionsData.steps.map((step, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[27px] top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                          <p className="text-sm text-gray-700 font-medium">{step.instruction}</p>
                          <p className="text-xs text-gray-400 mt-0.5">Offset: {step.distance_offset_km} km</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-red-500">Failed to load route directions.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
