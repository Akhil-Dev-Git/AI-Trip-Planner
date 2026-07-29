
import React, { useState, useEffect, useMemo } from "react";
import { Trip } from "@/entities/trip";
import { useTravelStats } from "@/contexts/TravelStatsContext";
import { Place } from "@/entities/place";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar,
  MapPin,
  Users,
  IndianRupee,
  Clock,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plane,
  CheckCircle,
  XCircle,
  X
} from "lucide-react";

const safeFormatDate = (dateStr, fmtStr) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "N/A" : format(d, fmtStr);
  } catch (e) {
    return "N/A";
  }
};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function TravelHistory() {
  const navigate = useNavigate();
  const { refreshStats } = useTravelStats();
  const [trips, setTrips] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const placeMap = useMemo(() => {
    if (!allPlaces.length) return {};
    return allPlaces.reduce((acc, place) => {
      acc[place.id] = place.name;
      return acc;
    }, {});
  }, [allPlaces]);

  const filteredTrips = useMemo(() => {
    if (statusFilter !== "all") {
      return trips.filter(trip => trip.status === statusFilter);
    }
    return trips;
  }, [trips, statusFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch trips and places in parallel for efficiency
      const [tripsData, placesData] = await Promise.all([
        Trip.list("-created_date"),
        Place.list()
      ]);
      setTrips(tripsData);
      setAllPlaces(placesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip plan?")) return;
    try {
      await Trip.delete(tripId);
      setTrips(prev => prev.filter(t => t.id !== tripId));
      setSelectedTrip(null);
      refreshStats();
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip. Please try again.");
    }
  };

  const handleUpdateTripStatus = async (tripId, newStatus) => {
    try {
      const tripToUpdate = trips.find(t => t.id === tripId);
      if (!tripToUpdate) return;
      const updated = await Trip.update(tripId, { ...tripToUpdate, status: newStatus });
      setTrips(prev => prev.map(t => t.id === tripId ? updated : t));
      setSelectedTrip(updated);
      refreshStats();
    } catch (error) {
      console.error("Error updating trip status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "planned": return "bg-blue-100 text-blue-800";
      case "ongoing": return "bg-green-100 text-green-800";
      case "completed": return "bg-gray-100 text-gray-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "planned": return Clock;
      case "ongoing": return Plane;
      case "completed": return CheckCircle;
      case "cancelled": return XCircle;
      default: return Clock;
    }
  };

  const stats = useMemo(() => {
    const totalTrips = trips.length;
    const completedTrips = trips.filter(t => t.status === "completed").length;
    const totalCost = trips.reduce((sum, trip) => sum + (trip.actual_cost || trip.total_estimated_cost || 0), 0);
    const plannedTrips = trips.filter(t => t.status === "planned").length;

    return { totalTrips, completedTrips, totalCost, plannedTrips };
  }, [trips]);

  return (
    <div className="min-h-screen realistic-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Travel History
          </h1>
          <p className="text-lg text-gray-600">
            Track your adventures and plan future journeys
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Trips</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalTrips}</p>
                </div>
                <Plane className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedTrips}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Planned</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.plannedTrips}</p>
                </div>
                <Clock className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-orange-600">₹{stats.totalCost.toLocaleString()}</p>
                </div>
                <IndianRupee className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-sm p-6 mb-8 relative z-50"
        >
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-white border-gray-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Trips List */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden animate-pulse">
                  <div className="h-32 bg-gray-200" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {filteredTrips.length === 0 ? (
                <div className="text-center py-16">
                  <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-gray-600 mb-2">No trips found</h3>
                  <p className="text-gray-500 mb-6">Start planning your next adventure!</p>
                  <Button onClick={() => navigate('/plan-trip')} className="bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600">
                    Plan Your First Trip
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTrips.map((trip, index) => {
                    const StatusIcon = getStatusIcon(trip.status);
                    return (
                      <motion.div
                        key={trip.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -8 }}
                        className="group"
                      >
                        <Card className="overflow-hidden bg-white hover:shadow-2xl transition-all duration-300 border-0 shadow-lg">
                          <div className="relative h-32 bg-gradient-to-br from-blue-400 to-teal-500">
                            {trip.places_to_visit && trip.places_to_visit.length > 0 && allPlaces.find(p => p.id === trip.places_to_visit[0])?.image_url && (
                              <img 
                                src={allPlaces.find(p => p.id === trip.places_to_visit[0]).image_url} 
                                alt={trip.destination}
                                className="w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-black/40" />
                            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                              <Badge className={`${getStatusColor(trip.status)} border-0`}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {trip.status}
                              </Badge>
                              <div className="flex gap-1">
                                <Button 
                                  size="icon" 
                                  variant="secondary" 
                                  className="w-6 h-6 bg-white/80 hover:bg-white"
                                  onClick={(e) => { e.stopPropagation(); setSelectedTrip(trip); }}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="destructive" 
                                  className="w-6 h-6 bg-red-500/80 hover:bg-red-600 text-white"
                                  onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="absolute bottom-4 left-4 text-white">
                              <h3 className="font-bold text-lg">{trip.trip_name}</h3>
                            </div>
                          </div>
                          
                          <CardContent className="p-6">
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm">{trip.destination}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm">
                                  {safeFormatDate(trip.start_date, "MMM d")} - {safeFormatDate(trip.end_date, "MMM d, yyyy")}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="w-4 h-4" />
                                <span className="text-sm">{trip.number_of_travelers} travelers</span>
                              </div>

                              <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-1 text-green-600">
                                  <IndianRupee className="w-4 h-4" />
                                  <span className="font-semibold">
                                    ₹{(trip.actual_cost || trip.total_estimated_cost || 0).toLocaleString()}
                                  </span>
                                </div>
                                
                                {trip.mood && (
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {trip.mood}
                                  </Badge>
                                )}
                              </div>

                              {trip.places_to_visit && trip.places_to_visit.length > 0 && (
                                <div className="pt-2">
                                  <p className="text-xs text-gray-500 mb-1">Places to visit:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {trip.places_to_visit.slice(0, 2).map((placeId, idx) => (
                                      <Badge key={idx} variant="secondary" className="text-xs">
                                        {placeMap[placeId] || 'Unknown Place'}
                                      </Badge>
                                    ))}
                                    {trip.places_to_visit.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{trip.places_to_visit.length - 2} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedTrip && (
            <motion.div
              key="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedTrip(null)}
            >
              <motion.div
                key="modal-content"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <Card className="border-0">
                  <CardHeader className="flex flex-row items-start justify-between pb-2">
                    <div>
                      <CardTitle className="text-2xl font-bold">{selectedTrip.trip_name}</CardTitle>
                      <p className="text-gray-500 flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4 text-blue-500" /> {selectedTrip.destination}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedTrip(null)} className="h-8 w-8 rounded-full hover:bg-slate-100">
                      <X className="w-5 h-5" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <p className="font-semibold capitalize text-blue-700">{selectedTrip.status}</p>
                      </div>
                      <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium">Duration</p>
                        <p className="font-semibold text-teal-700">
                          {selectedTrip.start_date && selectedTrip.end_date
                            ? Math.ceil((new Date(selectedTrip.end_date) - new Date(selectedTrip.start_date)) / (1000 * 60 * 60 * 24))
                            : 0} days
                        </p>
                      </div>
                      <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium">Travelers</p>
                        <p className="font-semibold text-purple-700">{selectedTrip.number_of_travelers}</p>
                      </div>
                      <div className="p-3 bg-orange-50/50 border border-orange-100 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium">Estimated Cost</p>
                        <p className="font-semibold text-orange-700">₹{(selectedTrip.actual_cost || selectedTrip.total_estimated_cost || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Itinerary & Route Details</h4>
                        <div className="space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-xl border">
                          <p><strong>Starting Location:</strong> {selectedTrip.origin || "N/A"}</p>
                          <p><strong>Mode of Transport:</strong> <span className="capitalize">{selectedTrip.mode_of_transport || "N/A"}</span></p>
                          <p><strong>Travel Dates:</strong> {safeFormatDate(selectedTrip.start_date, "MMM d, yyyy")} to {safeFormatDate(selectedTrip.end_date, "MMM d, yyyy")}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Change Trip Status</h4>
                        <div className="space-y-2">
                          <Select 
                            value={selectedTrip.status} 
                            onValueChange={(value) => handleUpdateTripStatus(selectedTrip.id, value)}
                          >
                            <SelectTrigger className="w-full bg-white border-gray-200">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="planned">Planned</SelectItem>
                              <SelectItem value="ongoing">Ongoing</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button 
                            variant="outline" 
                            onClick={() => handleDeleteTrip(selectedTrip.id)}
                            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Cancel & Delete Trip
                          </Button>
                        </div>
                      </div>
                    </div>

                    {selectedTrip.traveler_details && selectedTrip.traveler_details.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Traveler List</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {selectedTrip.traveler_details.map((traveler, idx) => (
                            <div key={idx} className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex justify-between">
                              <span className="font-medium text-slate-700">{traveler.name || `Traveler ${idx + 1}`}</span>
                              <span className="text-slate-500 capitalize">{traveler.relation || "Self"} ({traveler.age || "N/A"} yrs)</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Selected Places</h4>
                      {selectedTrip.places_to_visit && selectedTrip.places_to_visit.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedTrip.places_to_visit.map((placeId) => (
                            <Badge key={placeId} variant="secondary" className="px-2.5 py-1 text-slate-700 bg-slate-100 font-medium">
                              {placeMap[placeId] || 'Unknown Place'}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No specific sightseeing places selected.</p>
                      )}
                    </div>

                    {selectedTrip.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600 bg-amber-50/40 border border-amber-100 p-3 rounded-xl">{selectedTrip.notes}</p>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setSelectedTrip(null)}>Close View</Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
