
import React, { useState, useEffect, useMemo } from "react";
import { Trip } from "@/entities/trip";
import { useTravelStats } from "@/contexts/TravelStatsContext";
import { Place } from "@/entities/place";
import { useLocation } from "react-router-dom";
import { chatWithGroq, getGroqApiKey } from "../utils/ai";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  Plus,
  Minus,
  Save,
  Car,
  Plane,
  Train,
  Sparkles,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PlanTrip() {
  const location = useLocation();
  const { refreshStats } = useTravelStats();
  const urlParams = new URLSearchParams(location.search);
  const destinationParam = urlParams.get("destination");

  const [tripData, setTripData] = useState({
    trip_name: "",
    destination: destinationParam || "",
    start_date: "",
    end_date: "",
    origin: "",
    mode_of_transport: "",
    number_of_travelers: 1,
    traveler_details: [{ name: "", age: "", relation: "self" }],
    mood: "",
    places_to_visit: [],
    notes: ""
  });

  const [places, setPlaces] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedPlaceIds, setAnalyzedPlaceIds] = useState([]);

  useEffect(() => {
    loadPlaces();
  }, []);
  const estimatedCost = useMemo(() => {
    if (!tripData.start_date || !tripData.end_date) {
      return 0;
    }

    const startDate = new Date(tripData.start_date);
    const endDate = new Date(tripData.end_date);
    const timeDiff = endDate.getTime() - startDate.getTime();
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    if (days <= 0) {
      return 0;
    }

    const transportCosts = {
      flight: 8000,
      train: 1500,
      bus: 800,
      car: 3000,
      bike: 1000,
      mixed: 4000,
    };

    // Calculate average daily cost from selected places for a more realistic estimate.
    const avgDailyCost = selectedPlaces.length > 0
      ? selectedPlaces.reduce((acc, place) => acc + (place.estimated_cost_per_day || 2000), 0) / selectedPlaces.length
      : (tripData.destination ? 2000 : 0); // Use a default if a destination is set but no places are picked

    const accommodationAndActivityCost = avgDailyCost * days * tripData.number_of_travelers;
    const transportationCost = (transportCosts[tripData.mode_of_transport] || 0) * tripData.number_of_travelers;

    return accommodationAndActivityCost + transportationCost;
  }, [selectedPlaces, tripData.number_of_travelers, tripData.start_date, tripData.end_date, tripData.mode_of_transport]);

  const loadPlaces = async () => {
    try {
      const data = await Place.list();
      setPlaces(data);
    } catch (error) {
      console.error("Error loading places:", error);
    }
  };

  const handleAIAnalyze = async () => {
    if (!tripData.destination || !tripData.origin) {
      alert("Please enter both Starting From and Primary Destination first.");
      return;
    }
    
    const apiKey = getGroqApiKey();
    if (!apiKey) {
      alert("Please configure your Groq API Key in the AI Chat Assistant page first.");
      return;
    }

    setIsAnalyzing(true);
    try {
      // Build a simplified places catalog for the prompt to save tokens
      const catalog = places.map(p => ({
        id: p.id,
        name: p.name,
        location: p.location,
        mood: p.mood
      }));

      const prompt = `
I am traveling from ${tripData.origin} to ${tripData.destination}.
The desired mood of the trip is: ${tripData.mood || "Any"}.

Here is a catalog of available places:
${JSON.stringify(catalog)}

Return a JSON array of up to 10 'id' strings from the catalog that best fit my trip.
Return ONLY the raw JSON array of strings, nothing else. No markdown, no explanations.
`;

      const response = await chatWithGroq([{ role: "user", content: prompt }], apiKey);
      
      // Attempt to parse the response
      let placeIds = [];
      try {
        const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
        placeIds = JSON.parse(cleanJson);
      } catch (e) {
        console.error("Failed to parse Groq response:", response);
      }
      
      if (Array.isArray(placeIds) && placeIds.length > 0) {
        setAnalyzedPlaceIds(placeIds);
      } else {
        alert("The AI couldn't find exact matches for your trip. Try refining your destination or mood.");
      }
    } catch (error) {
      console.error("Error analyzing places:", error);
      alert(error.message || "Failed to analyze places");
    }
    setIsAnalyzing(false);
  };

  const suggestedPlaces = useMemo(() => {
    if (!places || places.length === 0) return [];
    
    if (analyzedPlaceIds.length > 0) {
      return analyzedPlaceIds.map(id => places.find(p => p.id === id)).filter(Boolean);
    }
    
    const moodQuery = (tripData.mood || "").toLowerCase();
    const destQuery = (tripData.destination || "").toLowerCase();
    
    // Score each destination based on selected mood and typed destination details
    let scored = places.map(place => {
      let score = 0;
      
      // Match mood
      if (moodQuery && place.mood?.toLowerCase() === moodQuery) {
        score += 100;
      }
      
      // Match destination input in place details (fuzzy query)
      if (destQuery) {
        if (place.name?.toLowerCase().includes(destQuery)) score += 50;
        if (place.location?.toLowerCase().includes(destQuery)) score += 30;
        if (place.region?.toLowerCase().includes(destQuery)) score += 20;
        if (place.description?.toLowerCase().includes(destQuery)) score += 10;
      }
      
      return { place, score };
    });
    
    // Sort destinations by score (most relevant first)
    scored.sort((a, b) => b.score - a.score);
    
    // Return more than 50 suggestions (up to 80)
    return scored.map(item => item.place).slice(0, 80);
  }, [places, tripData.destination, tripData.mood]);

  const handleInputChange = (field, value) => {
    setTripData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTravelerCount = (count) => {
    const newTravelers = Array(count).fill(null).map((_, index) =>
      tripData.traveler_details[index] || { name: "", age: "", relation: index === 0 ? "self" : "" }
    );

    setTripData(prev => ({
      ...prev,
      number_of_travelers: count,
      traveler_details: newTravelers
    }));
  };

  const updateTravelerDetail = (index, field, value) => {
    const newTravelers = [...tripData.traveler_details];
    newTravelers[index] = { ...newTravelers[index], [field]: value };

    setTripData(prev => ({
      ...prev,
      traveler_details: newTravelers
    }));
  };

  const togglePlaceSelection = (place) => {
    setSelectedPlaces(prev => {
      const isSelected = prev.find(p => p.id === place.id);
      if (isSelected) {
        return prev.filter(p => p.id !== place.id);
      } else {
        return [...prev, place];
      }
    });
  };

  const handleSaveTrip = async () => {
    setIsSaving(true);
    try {
      const tripToSave = {
        ...tripData,
        places_to_visit: selectedPlaces.map(p => p.id), // Store IDs for data integrity
        total_estimated_cost: estimatedCost,
        status: "planned"
      };

      await Trip.create(tripToSave);
      refreshStats();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving trip:", error);
    }
    setIsSaving(false);
  };

  const transportIcons = {
    flight: Plane,
    train: Train,
    bus: Car,
    car: Car,
    bike: Car,
    mixed: Car
  };

  return (
    <div className="min-h-screen realistic-bg p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Plan Your Perfect Trip
          </h1>
          <p className="text-lg text-gray-600">
            Create a detailed travel plan with cost estimation
          </p>
        </motion.div>

        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Save className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Trip saved successfully! You can view it in your Travel History.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trip Details Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl relative z-30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Trip Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="trip_name">Trip Name</Label>
                    <Input
                      id="trip_name"
                      placeholder="My Amazing Adventure"
                      value={tripData.trip_name}
                      onChange={(e) => handleInputChange("trip_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="destination">Primary Destination</Label>
                    <Input
                      id="destination"
                      placeholder="Goa, India"
                      value={tripData.destination}
                      onChange={(e) => handleInputChange("destination", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="origin">Starting From</Label>
                    <Input
                      id="origin"
                      placeholder="Mumbai, Maharashtra"
                      value={tripData.origin}
                      onChange={(e) => handleInputChange("origin", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="mood">Trip Mood</Label>
                    <Select value={tripData.mood} onValueChange={(value) => handleInputChange("mood", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mood" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adventure">Adventure</SelectItem>
                        <SelectItem value="relaxation">Relaxation</SelectItem>
                        <SelectItem value="cultural">Cultural</SelectItem>
                        <SelectItem value="spiritual">Spiritual</SelectItem>
                        <SelectItem value="romantic">Romantic</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="solo">Solo Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={tripData.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={tripData.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transport">Transportation</Label>
                    <Select value={tripData.mode_of_transport} onValueChange={(value) => handleInputChange("mode_of_transport", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flight">Flight</SelectItem>
                        <SelectItem value="train">Train</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="car_taxi">Car / Taxi</SelectItem>
                        <SelectItem value="auto_rickshaw">Auto Rickshaw</SelectItem>
                        <SelectItem value="metro_train">Metro Train</SelectItem>
                        <SelectItem value="bike_scooter">Bike / Scooter</SelectItem>
                        <SelectItem value="ferry_cruise">Ferry / Cruise</SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="mixed_mode">Mixed Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travelers */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl relative z-20">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Travelers ({tripData.number_of_travelers})
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTravelerCount(Math.max(1, tripData.number_of_travelers - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTravelerCount(tripData.number_of_travelers + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tripData.traveler_details.map((traveler, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-gray-50 rounded-lg">
                      <Input
                        placeholder="Name"
                        value={traveler.name}
                        onChange={(e) => updateTravelerDetail(index, "name", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Age"
                        value={traveler.age}
                        onChange={(e) => updateTravelerDetail(index, "age", e.target.value)}
                      />
                      <Input
                        placeholder="Relation (e.g., spouse, child)"
                        value={traveler.relation}
                        onChange={(e) => updateTravelerDetail(index, "relation", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Places to Visit */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl relative z-10">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-600" />
                    Select Places to Visit
                  </CardTitle>
                  <Button 
                    onClick={handleAIAnalyze} 
                    disabled={isAnalyzing || !tripData.destination || !tripData.origin}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md border-0"
                  >
                    {isAnalyzing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    AI Analyzer
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {suggestedPlaces.map((place) => (
                    <div
                      key={place.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex gap-4 ${
                        selectedPlaces.find(p => p.id === place.id)
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => togglePlaceSelection(place)}
                    >
                      <div className="w-24 h-24 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                        {place.image_url ? (
                          <img 
                            src={place.image_url} 
                            alt={place.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-gray-900 truncate pr-2">{place.name}</h4>
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              {place.region?.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 truncate">{place.location}</p>
                        </div>
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" />
                          ₹{place.estimated_cost_per_day}/day
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedPlaces.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">Selected Places:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPlaces.map((place) => (
                        <Badge key={place.id} className="bg-blue-100 text-blue-800">
                          {place.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Any special requirements, preferences, or notes for your trip..."
                  value={tripData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="min-h-[100px]"
                />
              </CardContent>
            </Card>
          </div>

          {/* Cost Summary */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IndianRupee className="w-5 h-5 text-green-600" />
                  Cost Estimation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ₹{estimatedCost.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">Total Estimated Cost</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>Travelers:</span>
                    <span className="font-medium">{tripData.number_of_travelers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">
                      {tripData.start_date && tripData.end_date
                        ? Math.ceil((new Date(tripData.end_date) - new Date(tripData.start_date)) / (1000 * 60 * 60 * 24))
                        : 0} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Places:</span>
                    <span className="font-medium">{selectedPlaces.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Per Person:</span>
                    <span className="font-medium">
                      ₹{tripData.number_of_travelers > 0 ? Math.round(estimatedCost / tripData.number_of_travelers).toLocaleString() : 0}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleSaveTrip}
                  disabled={isSaving || !tripData.trip_name || !tripData.destination}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Trip Plan
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  * Costs are estimated and may vary based on actual choices and seasonal pricing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
