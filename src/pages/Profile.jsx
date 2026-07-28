import React, { useState, useEffect, useRef } from "react";
import { User } from "@/entities/User";
import { useTravelStats } from "@/contexts/TravelStatsContext";
import { motion } from "framer-motion";
import { 
  User as UserIcon,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Settings,
  Save,
  Camera,
  Plane,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

const travelMoods = [
  { value: "adventure", label: "Adventure Seeker" },
  { value: "relaxation", label: "Relaxation Lover" },
  { value: "cultural", label: "Culture Enthusiast" },
  { value: "luxury", label: "Luxury Traveler" },
  { value: "budget", label: "Budget Explorer" },
  { value: "solo", label: "Solo Traveler" },
  { value: "family", label: "Family Traveler" }
];

const budgetRanges = [
  { value: "budget", label: "Budget (₹5,000-15,000/trip)" },
  { value: "mid-range", label: "Mid-range (₹15,000-50,000/trip)" },
  { value: "luxury", label: "Luxury (₹50,000+/trip)" }
];

const travelStyles = [
  { value: "planned", label: "Planned & Organized" },
  { value: "spontaneous", label: "Spontaneous & Flexible" },
  { value: "mixed", label: "Mix of Both" }
];

export default function Profile() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    full_name: "",
    email: "",
    bio: "",
    location: "",
    preferred_mood: "",
    travel_budget: "",
    travel_style: "",
    languages: [],
    interests: []
  });
  const [isSaving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const travelStats = useTravelStats(); // Use the centralized context
  const avatarInputRef = useRef(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      
      // Set profile data from user data if it exists
      setProfileData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || "",
        preferred_mood: userData.preferred_mood || "",
        travel_budget: userData.travel_budget || "",
        travel_style: userData.travel_style || "",
        languages: userData.languages || [],
        interests: userData.interests || []
      });
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleInterest = (interest) => {
    const newInterests = profileData.interests.includes(interest)
      ? profileData.interests.filter(i => i !== interest)
      : [...profileData.interests, interest];
    handleInputChange("interests", newInterests);
  };

  const handleAvatarUploadClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
      // In a real application, you would upload this file to a server.
      // For example:
      // const formData = new FormData();
      // formData.append('avatar', file);
      // await User.uploadAvatar(formData);
      alert(`Selected ${file.name}. Upload logic would go here.`);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await User.updateMyUserData(profileData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen realistic-bg p-4 md:p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen realistic-bg p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-lg text-gray-600">
            Customize your travel preferences and personal information
          </p>
        </motion.div>

        {saveSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Save className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6 text-center">
                <div className="flex justify-end mb-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 rounded-full hover:bg-blue-50 hover:text-blue-600"
                    onClick={() => setIsEditingHeader(!isEditingHeader)}
                    title={isEditingHeader ? "Cancel Edit" : "Edit Name & Email"}
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-teal-500 rounded-full flex items-center justify-center mx-auto">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <input
                    type="file"
                    ref={avatarInputRef}
                    onChange={handleAvatarChange}
                    className="hidden"
                    accept="image/png, image/jpeg"
                  />
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute -bottom-2 right-1/4 w-8 h-8 rounded-full shadow-md"
                    onClick={handleAvatarUploadClick}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                {isEditingHeader ? (
                  <div className="space-y-3 mb-4 text-left">
                    <div>
                      <Label htmlFor="header-name" className="text-xs text-gray-500">Full Name</Label>
                      <Input 
                        id="header-name"
                        value={profileData.full_name} 
                        onChange={(e) => handleInputChange("full_name", e.target.value)}
                        className="text-center h-8"
                      />
                    </div>
                    <div>
                      <Label htmlFor="header-email" className="text-xs text-gray-500">Email Address</Label>
                      <Input 
                        id="header-email"
                        value={profileData.email} 
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="text-center h-8"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {profileData.full_name || "Travel Explorer"}
                    </h3>
                    
                    <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{profileData.email}</span>
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Member since</span>
                    <span className="font-medium">
                      {user?.created_date ? new Date(user.created_date).getFullYear() : "2024"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Role</span>
                    <Badge variant="outline" className="capitalize">
                      {user?.role || "user"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Plane className="w-5 h-5 text-blue-600" />
                  Travel Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trips Planned</span>
                  <span className="font-bold text-blue-600">{travelStats.tripsPlanned}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Places Visited</span>
                  <span className="font-bold text-green-600">{travelStats.placesVisited}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Favorite Mood</span>
                  <span className="font-bold text-purple-600 capitalize">
                    {profileData.preferred_mood || "Not set"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself and your travel interests..."
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Current Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="location"
                        placeholder="Mumbai, India"
                        value={profileData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                        className="pl-10 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="preferred_mood">Travel Personality</Label>
                    <Select 
                      value={profileData.preferred_mood} 
                      onValueChange={(value) => handleInputChange("preferred_mood", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your style" />
                      </SelectTrigger>
                      <SelectContent>
                        {travelMoods.map((mood) => (
                          <SelectItem key={mood.value} value={mood.value}>
                            {mood.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Travel Preferences */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  Travel Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="travel_budget">Budget Range</Label>
                    <Select 
                      value={profileData.travel_budget} 
                      onValueChange={(value) => handleInputChange("travel_budget", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select budget range" />
                      </SelectTrigger>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="travel_style">Travel Style</Label>
                    <Select 
                      value={profileData.travel_style} 
                      onValueChange={(value) => handleInputChange("travel_style", value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select travel style" />
                      </SelectTrigger>
                      <SelectContent>
                        {travelStyles.map((style) => (
                          <SelectItem key={style.value} value={style.value}>
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Travel Interests</Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["Photography", "Food", "Adventure", "History", "Nature", "Architecture", "Music", "Art"].map((interest) => (
                      <Badge 
                        key={interest}
                        variant="outline" 
                        className="cursor-pointer hover:bg-blue-50 transition-colors"
                        onClick={() => handleToggleInterest(interest)}
                      >
                        <Heart className={`w-3 h-3 mr-1 ${
                          profileData.interests.includes(interest) 
                            ? "fill-current text-blue-600" 
                            : ""
                        }`} />
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Saving Profile...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}