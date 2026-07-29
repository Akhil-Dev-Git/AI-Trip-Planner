import json
import os

regions = ["south_india", "north_india", "international"]

moods = [
    "adventure", "relaxation", "cultural", "spiritual", "romantic", 
    "family", "solo", "luxury", "budget", "nature", 
    "urban", "heritage", "beach", "mountain", "desert", 
    "wildlife", "festival", "food", "art", "wellness"
]

locations = {
    "south_india": [
        ("Wayanad, Kerala, India", 11.5389, 76.0841),
        ("Coorg, Karnataka, India", 12.3375, 75.8069),
        ("Munnar, Kerala, India", 10.0889, 77.0595),
        ("Varkala, Kerala, India", 8.7338, 76.7059),
        ("Kumarakom, Kerala, India", 9.5833, 76.4167),
        ("Ooty, Tamil Nadu, India", 11.4100, 76.6950),
        ("Kodaikanal, Tamil Nadu, India", 10.2381, 77.4892),
        ("Hampi, Karnataka, India", 15.3350, 76.4600),
        ("Mysore, Karnataka, India", 12.2958, 76.6394),
        ("Madurai, Tamil Nadu, India", 9.9195, 78.1193),
        ("Rameswaram, Tamil Nadu, India", 9.2876, 79.3129),
        ("Pondicherry, India", 11.9416, 79.8083),
        ("Gokarna, Karnataka, India", 14.5479, 74.3188),
        ("Dandeli, Karnataka, India", 15.2449, 74.6229),
        ("Bekal, Kerala, India", 12.3837, 75.0326),
        ("Coimbatore, Tamil Nadu, India", 11.0168, 76.9558),
        ("Hyderabad, Telangana, India", 17.3850, 78.4867),
        ("Bangalore, Karnataka, India", 12.9716, 77.5946),
        ("Chennai, Tamil Nadu, India", 13.0827, 80.2707),
        ("Vizag, Andhra Pradesh, India", 17.6868, 83.2185)
    ],
    "north_india": [
        ("Rishikesh, Uttarakhand, India", 30.0869, 78.2676),
        ("Manali, Himachal Pradesh, India", 32.2396, 77.1887),
        ("Shimla, Himachal Pradesh, India", 31.1048, 77.1734),
        ("Dharamshala, Himachal Pradesh, India", 32.2190, 76.3234),
        ("Jaipur, Rajasthan, India", 26.9124, 75.7873),
        ("Udaipur, Rajasthan, India", 24.5854, 73.7125),
        ("Jaisalmer, Rajasthan, India", 26.9157, 70.9083),
        ("Jodhpur, Rajasthan, India", 26.2389, 73.0243),
        ("Varanasi, Uttar Pradesh, India", 25.3176, 83.0104),
        ("Agra, Uttar Pradesh, India", 27.1767, 78.0081),
        ("Amritsar, Punjab, India", 31.6340, 74.8723),
        ("Leh, Ladakh, India", 34.1526, 77.5771),
        ("Srinagar, Jammu & Kashmir, India", 34.0837, 74.7973),
        ("Gulmarg, Jammu & Kashmir, India", 34.0484, 74.3805),
        ("Pushkar, Rajasthan, India", 26.4883, 74.5517),
        ("Jim Corbett, Uttarakhand, India", 29.5300, 78.7747),
        ("Bir Billing, Himachal Pradesh, India", 32.0437, 76.7214),
        ("Delhi, India", 28.6139, 77.2090),
        ("Chandigarh, India", 30.7333, 76.7794),
        ("Nainital, Uttarakhand, India", 29.3803, 79.4636)
    ],
    "international": [
        ("Tokyo, Japan", 35.6762, 139.6503),
        ("Kyoto, Japan", 35.0116, 135.7681),
        ("Paris, France", 48.8566, 2.3522),
        ("Rome, Italy", 41.9028, 12.4964),
        ("Venice, Italy", 45.4408, 12.3155),
        ("Florence, Italy", 43.7696, 11.2558),
        ("Bangkok, Thailand", 13.7563, 100.5018),
        ("Phuket, Thailand", 7.8804, 98.3922),
        ("Bali, Indonesia", -8.4095, 115.1889),
        ("Zurich, Switzerland", 47.3769, 8.5417),
        ("Zermatt, Switzerland", 46.0207, 7.7491),
        ("Marrakech, Morocco", 31.6295, -7.9811),
        ("New York, USA", 40.7128, -74.0060),
        ("Grand Canyon, USA", 36.0544, -112.1401),
        ("London, UK", 51.5074, -0.1278),
        ("Sydney, Australia", -33.8688, 151.2093),
        ("Cape Town, South Africa", -33.9249, 18.4241),
        ("Maldives", 3.2028, 73.2207),
        ("Dubai, UAE", 25.2048, 55.2708),
        ("Singapore", 1.3521, 103.8198)
    ]
}

mood_suffixes = {
    "adventure": ["Adventure Park", "Expedition Outpost", "Outdoor Basecamp", "Thrill Ridge", "Trekking Trail", "Skyline Zipline", "Wild Canyon", "Rafting Camp", "Ski Slopes", "Climbing Center"],
    "relaxation": ["Ayurveda Retreat", "Spa Oasis", "Resort & Lounge", "Lotus Sanctuary", "Peace Valley", "Quiet Meadows", "Wellness Cove", "Silent Spring", "Zen Garden", "Breeze Villa"],
    "cultural": ["Cultural Centre", "Heritage Pavilion", "Artisans Village", "Folk Theatre", "History Museum", "Crafts Bazaar", "Traditional Theatre", "Customs House", "Old Town Plaza", "Folk Museum"],
    "spiritual": ["Temple Complex", "Sacred Shrine", "Mindfulness Ashram", "Ganga Ghat Aarti", "Zen Monastery", "Sacred Grove", "Meditation Sanctuary", "Pilgrim Path", "Cathedral Walk", "Prayer Hall"],
    "romantic": ["Honeymoon Backwaters", "Sunset Point", "Candlelight Terrace", "Villas of Love", "Lover's Peak", "Whispering Pines", "Scenic Overlook", "Romantic Houseboat", "Serenade Garden", "Castle View"],
    "family": ["Amusement Park", "Science Centre", "Family Resort", "Playland & Gardens", "Kids Fun Zone", "Interactive Museum", "Zoo & Safari", "Lakeside Picnic", "Adventure Castle", "Marine World"],
    "solo": ["Backpacker Hostel", "Surf Camp", "Nomad Co-working", "Solo Wanderer Lodge", "Explorer Base", "Hostel & Hub", "Trailhead Inn", "Cozy Nest", "Backyard Cabin", "Meeting Point"],
    "luxury": ["Palace Hotel", "Five-Star Villa", "Premium Residency", "Elite Club & Spa", "Signature Suite", "Luxury Estate", "Golden Bay Resort", "Grand Chateau", "Skyline Penthouse", "Imperial Court"],
    "budget": ["Backpackers Haven", "Budget Stay", "Econo Lodge", "Friendly Guesthouse", "Affordable Dorms", "Paisa Vasool Inn", "Smart Rest House", "Green Cabin", "Value Stay", "Express Inn"],
    "nature": ["Forest Reserve", "Eco Park", "Waterfall Cascade", "Botanical Sanctuary", "Green Valley", "Nature Trail", "Lakeside Woods", "Pine Forest Walk", "Wildflower Meadows", "Rainforest Camp"],
    "urban": ["Metropolitan Hub", "Times Square Plaza", "Central Business District", "IT Corridor Walk", "Skyline View Deck", "Modern City Centre", "Shopping Boulevard", "Food Street Market", "Metro Station Plaza", "Downtown Lounge"],
    "heritage": ["Ancient Ruins", "Archaeological Site", "Historical Fort", "Raja Palace", "Old Castle Walls", "Centuries Old Monument", "Heritage Museum", "Legacy Arch", "Colonial Mansion", "Ancient Caves"],
    "beach": ["White Sand Beach", "Sunny Cove", "Surf Bay", "Lagoon Shore", "Shell Island", "Coconut Beach Shore", "Crescent Cliff Shore", "Seaside Boardwalk", "Coral Bay", "Golden Sands"],
    "mountain": ["Snowy Slopes", "Hill Station Ridge", "Mountain Pass View", "Alpine Valley Trek", "Glacier Overlook", "Cloudy Peaks", "Highland Meadows", "Mist Valley", "Summit Peak Point", "Foliage Ridge"],
    "desert": ["Sand Dunes Camp", "Oasis Village", "Camel Safari Trail", "Teri Dunes Sandscape", "Red Sand Valley", "Cactus Garden Walk", "Dry Lands Outpost", "Sunset Desert Deck", "Starry Night Camp", "Nomadic Tents"],
    "wildlife": ["Tiger Reserve", "Elephant Sanctuary", "Bird Watching Hub", "National Safari Park", "Deer Park Forest", "Crocodile Bank", "Reptile Sanctuary", "Leopard Ridge", "Fauna Biosphere", "Jungle Reserve"],
    "festival": ["Pooram Celebration Arena", "Holi Fest Ground", "Carnival Parade Square", "Literature Fest Pavilion", "Flower Show Grounds", "Lantern Fest Lake", "Samba Parade Ground", "Music Fest Amphitheatre", "Cultural Carnival", "Exhibition Hall"],
    "food": ["Street Food Alley", "Culinary Trail Walk", "Fish Market Stalls", "Spice Market Lane", "Sweet Meat Street", "Biryani & Kebabs Corner", "Cafe & Bakery Row", "Organic Farms Dine", "Seafood Beach Shacks", "Gourmet Dining Hall"],
    "art": ["Modern Art Gallery", "Contemporary Art Warehouse", "Biennale Pavilions", "Sculpture Garden", "Classic Portrait Gallery", "Creative Art Lab", "Mural Street Wall", "Artisans Studio", "Exhibition Gallery", "Masterpiece Museum"],
    "wellness": ["Yoga Barn", "Holistic Wellness Retreat", "Healing Sound Sanctuary", "Meditation Ashram", "Hot Springs Resort", "Silent Retreat Cabin", "Sattvik Food Wellness", "Aromatherapy Lounge", "Mind & Body Oasis", "Chakra Balance Center"]
}

image_mood_map = {
    "adventure": "https://images.unsplash.com/photo-1530866495561-507c9faab2ed?auto=format&fit=crop&w=800&q=80",
    "relaxation": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    "cultural": "https://images.unsplash.com/photo-1600100397608-f010e42ecf8e?auto=format&fit=crop&w=800&q=80",
    "spiritual": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80",
    "romantic": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    "family": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "solo": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
    "luxury": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80",
    "budget": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    "nature": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=800&q=80",
    "urban": "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=800&q=80",
    "heritage": "https://images.unsplash.com/photo-1600100397608-f010e42ecf8e?auto=format&fit=crop&w=800&q=80",
    "beach": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    "mountain": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    "desert": "https://images.unsplash.com/photo-1452723312111-3a7d0db0e024?auto=format&fit=crop&w=800&q=80",
    "wildlife": "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80",
    "festival": "https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80",
    "food": "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    "art": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80",
    "wellness": "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=800&q=80"
}

places = []
place_id = 1

for mood in moods:
    suffixes = mood_suffixes[mood]
    img = image_mood_map[mood]
    
    # We need 100 places for each mood
    for i in range(100):
        # Distribute regions: 33 south, 33 north, 34 international
        if i < 33:
            region = "south_india"
        elif i < 66:
            region = "north_india"
        else:
            region = "international"
            
        region_locations = locations[region]
        loc = region_locations[i % len(region_locations)]
        
        city = loc[0].split(',')[0]
        suffix = suffixes[i % len(suffixes)]
        name = f"{city} {suffix} {i//10 + 1}"
        
        # Generate a unique, realistic image based on the city and mood using Pollinations AI
        import urllib.parse
        prompt = f"realistic travel photography of {city} {mood} destination beautiful scenery"
        encoded_prompt = urllib.parse.quote(prompt)
        img = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true&seed={place_id}"
        
        # Add offset to coordinates to make each location unique
        lat = loc[1] + (i % 10) * 0.005
        lng = loc[2] + (i % 10) * 0.005
        
        # Costs vary based on mood and region
        if mood == "luxury":
            cost = 25000 + (i % 5) * 5000
        elif mood == "budget":
            cost = 800 + (i % 5) * 300
        else:
            cost = 2000 + (i % 5) * 1500
            
        durations = [2, 3, 4, 5, 7]
        duration = durations[i % len(durations)]
        
        hotels = [
            {"name": f"{city} Grand Plaza", "rating": 4.5, "price_per_night": cost * 2},
            {"name": f"{city} Heritage Inn", "rating": 4.2, "price_per_night": int(cost * 1.2)},
            {"name": f"{city} Backpackers", "rating": 4.0, "price_per_night": int(cost * 0.4)}
        ]
        
        restaurants = [
            {"name": f"{city} Local Diner", "cuisine": "Traditional Local", "avg_cost_for_two": int(cost * 0.3)},
            {"name": f"{city} Bistro & Cafe", "cuisine": "Multi-cuisine", "avg_cost_for_two": int(cost * 0.5)}
        ]
        
        transports = ["Local Taxi", "Auto-rickshaw", "Public Bus"]
        if region == "international":
            transports.append("Subway Train")
            
        activities = [
            f"Explore local {mood} spots",
            f"Sightseeing and heritage photography",
            f"Try local specialty dishes"
        ]
        
        places.append({
            "id": str(place_id),
            "name": name,
            "location": loc[0],
            "region": region,
            "mood": mood,
            "description": f"Experience the incredible {mood} and vibrant atmosphere of {name}. Located in {loc[0]}, this destination offers prime sightseeing, excellent stays, and diverse local activities.",
            "image_url": img,
            "latitude": round(lat, 4),
            "longitude": round(lng, 4),
            "estimated_cost_per_day": cost,
            "best_time_to_visit": "October to March" if i % 2 == 0 else "September to May",
            "duration_days": duration,
            "nearby_hotels": hotels,
            "nearby_restaurants": restaurants,
            "transportation_options": transports,
            "activities": activities
        })
        
        place_id += 1

# Write to places.json
output_path = os.path.join(os.path.dirname(__file__), 'places.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(places, f, indent=2, ensure_ascii=False)

print(f"Successfully generated {len(places)} places in {output_path}")
