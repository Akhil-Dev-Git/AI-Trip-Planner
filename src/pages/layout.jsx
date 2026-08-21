import { Link, useLocation } from "react-router-dom";
import { useTravelStats } from "../contexts/TravelStatsContext";
import { useAuth } from "../contexts/AuthContext";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import {
  Compass, 
  MapPin, 
  Calendar, 
  History, 
  User, 
  Heart,
  Plane,
  Sparkles,
  Globe2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "../components/ui/sidebar";

const navigationItems = [
  {
    title: "Mood Dashboard",
    url: createPageUrl("MoodDashboard"),
    icon: Heart,
  },
  {
    title: "Explore Places",
    url: createPageUrl("ExplorePlaces"),
    icon: MapPin,
  },
  {
    title: "Plan Trip",
    url: createPageUrl("PlanTrip"),
    icon: Calendar,
  },
  {
    title: "AI Chat Assistant",
    url: createPageUrl("AIChatAssistant"),
    icon: Sparkles,
  },
  {
    title: "Travel History",
    url: createPageUrl("TravelHistory"),
    icon: History,
  },
  {
    title: "Profile",
    url: createPageUrl("Profile"),
    icon: User,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { tripsPlanned, placesVisited } = useTravelStats();
  const { user } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-[100dvh] flex w-full realistic-bg">
        <Sidebar className="border-r border-blue-100/50 glass-panel">
          <SidebarHeader className="border-b border-blue-100 p-6">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 180, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="p-2 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-xl shadow-lg"
              >
                <Globe2 className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg tracking-tight">AI Trip Planner</h2>
                <p className="text-xs text-gray-500 font-medium">NATPAC Travel Assistant</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 rounded-lg ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:text-white shadow-md' 
                            : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2.5">
                          <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                            <item.icon className="w-5 h-5" />
                          </motion.div>
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <div className="px-3 py-2 space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Plane className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-600">Trips Planned</span>
                    <span className="ml-auto font-bold text-blue-600">{tripsPlanned}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-teal-400" />
                    <span className="text-gray-600">Places Explored</span>
                    <span className="ml-auto font-bold text-teal-600">{placesVisited}</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-blue-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full flex items-center justify-center shadow-sm">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate capitalize">{user?.username || 'Travel Explorer'}</p>
                <p className="text-xs text-gray-500 truncate">Discover your next adventure</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="bg-white/90 backdrop-blur-sm border-b border-blue-100 px-6 py-4 lg:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-xl font-bold text-gray-900">AI Trip Planner</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}