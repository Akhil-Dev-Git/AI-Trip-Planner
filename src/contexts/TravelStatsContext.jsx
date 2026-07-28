import React, { createContext, useState, useEffect, useContext } from 'react';
import { Trip } from '../entities/trip';

const TravelStatsContext = createContext();

export const useTravelStats = () => useContext(TravelStatsContext);

export const TravelStatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    tripsPlanned: 0,
    placesVisited: 0,
    isLoading: true,
  });

  const loadTravelStats = async () => {
    try {
      const trips = await Trip.list();
      const tripsPlanned = trips.length;
      const placesVisited = new Set(trips.flatMap(trip => trip.places_to_visit || [])).size;
      setStats({ tripsPlanned, placesVisited, isLoading: false });
    } catch (error) {
      console.error("Error loading travel stats:", error);
      setStats({ tripsPlanned: 0, placesVisited: 0, isLoading: false });
    }
  };

  useEffect(() => {
    loadTravelStats();
  }, []);

  // You can also add a function to refresh stats here
  const refreshStats = () => {
    setStats(prev => ({ ...prev, isLoading: true }));
    loadTravelStats();
  };

  const value = { ...stats, refreshStats };

  return (
    <TravelStatsContext.Provider value={value}>
      {children}
    </TravelStatsContext.Provider>
  );
};