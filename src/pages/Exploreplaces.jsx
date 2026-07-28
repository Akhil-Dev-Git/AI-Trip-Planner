
import React, { useState, useEffect, useMemo } from "react";
import { Place } from "@/entities/place";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Filter, 
  Search, 
  Star,
  IndianRupee,
  Clock,
  Users,
  Heart,
  ArrowLeft
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ExplorePlaces() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const moodParam = urlParams.get("mood");
  
  const [places, setPlaces] = useState([]);
  const [selectedMood, setSelectedMood] = useState(moodParam || "all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // loadPlaces is stable as it only depends on setPlaces and setIsLoading, which are stable functions.
  // No need to wrap in useCallback unless it uses other external variables that could change.
  const loadPlaces = async () => {
    try {
      const data = await Place.list();
      setPlaces(data);
    } catch (error) {
      console.error("Error loading places:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadPlaces();
  }, []); // Empty dependency array means this runs once on mount

  const filteredPlaces = useMemo(() => {
    let filtered = places;

    if (selectedMood !== "all") {
      filtered = filtered.filter(place => place.mood === selectedMood);
    }
    if (selectedRegion !== "all") {
      filtered = filtered.filter(place => place.region === selectedRegion);
    }
    if (searchQuery) {
      filtered = filtered.filter(place => 
        place.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  }, [places, selectedMood, selectedRegion, searchQuery]);

  const regionLabels = {
    "south_india": "South India",
    "north_india": "North India", 
    "international": "International"
  };

  const moodLabels = {
    "adventure": "Adventure",
    "relaxation": "Relaxation",
    "cultural": "Cultural",
    "spiritual": "Spiritual",
    "romantic": "Romantic",
    "family": "Family",
    "solo": "Solo Travel",
    "luxury": "Luxury",
    "budget": "Budget-Friendly",
    "nature": "Nature",
    "urban": "Urban",
    "heritage": "Heritage",
    "beach": "Beach",
    "mountain": "Mountain",
    "desert": "Desert",
    "wildlife": "Wildlife",
    "festival": "Festival",
    "food": "Food",
    "art": "Art & Culture",
    "wellness": "Wellness"
  };

  return (
    <div className="min-h-screen realistic-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("MoodDashboard")}>
              <Button variant="outline" size="icon" className="hover:bg-blue-50">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Explore Amazing Places
              </h1>
              {moodParam && (
                <p className="text-lg text-gray-600 mt-1">
                  Perfect for your {moodLabels[moodParam]} mood
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="relative z-30 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search destinations..."
                  className="pl-10 bg-white border-gray-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedMood} onValueChange={setSelectedMood}>
              <SelectTrigger className="w-full md:w-48 bg-white border-gray-200">
                <SelectValue placeholder="Select Mood" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Moods</SelectItem>
                {Object.entries(moodLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-48 bg-white border-gray-200">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {Object.entries(regionLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              {filteredPlaces.length === 0 ? (
                <div className="text-center py-16">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No places found</h3>
                  <p className="text-gray-500">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlaces.map((place) => (
                    <div
                      key={place.id}
                      className="group hover:-translate-y-2 transition-transform duration-300"
                    >
                      <Link to={`${createPageUrl("PlaceDetails")}?id=${place.id}`}>
                        <Card className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                          <div className="relative">
                            <div className="h-48 bg-gradient-to-br from-blue-200 to-teal-200 relative overflow-hidden">
                              {place.image_url ? (
                                <img 
                                  src={place.image_url} 
                                  alt={place.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <MapPin className="w-12 h-12 text-white/60" />
                                </div>
                              )}
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-white/90 text-gray-800 border-0">
                                  {regionLabels[place.region]}
                                </Badge>
                                <Badge className={`border-0 ml-2 ${place.region === 'international' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                  {place.region === 'international' ? 'International' : 'National'}
                                </Badge>
                              </div>
                              <div className="absolute top-3 right-3">
                                <Button
                                  size="icon"
                                  variant="secondary"
                                  className="w-8 h-8 bg-white/80 hover:bg-white"
                                >
                                  <Heart className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                  {place.name}
                                </h3>
                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {place.location}
                                </p>
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {place.description}
                            </p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3" />
                                  ₹{place.estimated_cost_per_day}/day
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {place.duration_days}d
                                </span>
                              </div>
                              
                              <Badge variant="outline" className="capitalize">
                                {place.mood?.replace('_', ' ')}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
