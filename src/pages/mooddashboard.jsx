import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { 
  Mountain, 
  Heart, 
  Users, 
  User, 
  Crown, 
  Wallet,
  Leaf,
  Building,
  Camera,
  Waves,
  Sun,
  TreePine,
  Music,
  Utensils,
  Palette,
  Sparkles
} from "lucide-react";

const moods = [
  { id: "adventure", name: "Adventure", icon: Mountain, color: "from-orange-500 to-red-500", description: "Thrilling experiences and outdoor activities" },
  { id: "relaxation", name: "Relaxation", icon: Sparkles, color: "from-blue-400 to-cyan-400", description: "Peaceful retreats and spa destinations" },
  { id: "cultural", name: "Cultural", icon: Camera, color: "from-purple-500 to-pink-500", description: "Rich heritage and traditional experiences" },
  { id: "spiritual", name: "Spiritual", icon: Heart, color: "from-yellow-400 to-orange-400", description: "Sacred places and mindful journeys" },
  { id: "romantic", name: "Romantic", icon: Heart, color: "from-pink-500 to-rose-500", description: "Perfect for couples and romantic getaways" },
  { id: "family", name: "Family", icon: Users, color: "from-green-400 to-blue-400", description: "Fun activities for all ages" },
  { id: "solo", name: "Solo Travel", icon: User, color: "from-indigo-500 to-purple-500", description: "Perfect for independent travelers" },
  { id: "luxury", name: "Luxury", icon: Crown, color: "from-yellow-500 to-amber-500", description: "Premium experiences and five-star comfort" },
  { id: "budget", name: "Budget-Friendly", icon: Wallet, color: "from-emerald-400 to-teal-500", description: "Great experiences without breaking the bank" },
  { id: "nature", name: "Nature", icon: Leaf, color: "from-green-500 to-emerald-500", description: "Natural wonders and eco-friendly destinations" },
  { id: "urban", name: "Urban", icon: Building, color: "from-gray-500 to-slate-600", description: "City life and metropolitan experiences" },
  { id: "heritage", name: "Heritage", icon: Camera, color: "from-amber-600 to-orange-600", description: "Historical sites and ancient wonders" },
  { id: "beach", name: "Beach", icon: Waves, color: "from-cyan-400 to-blue-500", description: "Coastal destinations and water activities" },
  { id: "mountain", name: "Mountain", icon: Mountain, color: "from-slate-600 to-gray-700", description: "Hill stations and mountain adventures" },
  { id: "desert", name: "Desert", icon: Sun, color: "from-yellow-600 to-orange-500", description: "Desert landscapes and unique cultures" },
  { id: "wildlife", name: "Wildlife", icon: TreePine, color: "from-green-600 to-lime-500", description: "Safari and wildlife sanctuaries" },
  { id: "festival", name: "Festival", icon: Music, color: "from-violet-500 to-purple-600", description: "Celebrations and cultural festivals" },
  { id: "food", name: "Food", icon: Utensils, color: "from-red-500 to-pink-500", description: "Culinary journeys and food experiences" },
  { id: "art", name: "Art & Culture", icon: Palette, color: "from-indigo-400 to-blue-500", description: "Museums, galleries, and artistic experiences" },
  { id: "wellness", name: "Wellness", icon: Sparkles, color: "from-teal-400 to-green-400", description: "Health, wellness, and rejuvenation" },
];

export default function MoodDashboard() {
  return (
    <div className="min-h-screen realistic-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent mb-4">
            How are you feeling today?
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            Choose your travel mood and discover amazing destinations tailored just for you
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {moods.map((mood, index) => (
            <motion.div
              key={mood.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                to={`${createPageUrl("ExplorePlaces")}?mood=${mood.id}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100">
                  <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative p-6">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${mood.color} p-3 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <mood.icon className="w-full h-full text-white" />
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {mood.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {mood.description}
                    </p>
                  </div>
                  
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${mood.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
            <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-teal-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Powered by NATPAC AI Travel Intelligence</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}