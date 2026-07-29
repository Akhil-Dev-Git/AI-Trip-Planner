import json
import sqlite3

# Define a robust mapping of keywords to specific Unsplash image URLs
keyword_map = {
    # Adventure
    "rafting": [
        "https://images.unsplash.com/photo-1533692328991-08159ff19fca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # Rafting
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "climbing": [
        "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # Rock climbing
        "https://images.unsplash.com/photo-1564769662533-4f00a87b4056?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "ski": [
        "https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # Skiing
        "https://images.unsplash.com/photo-1605540436563-5bca919ae766?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "canyon": [
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "trekking": [
        "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "adventure": [
        "https://images.unsplash.com/photo-1533692328991-08159ff19fca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516939884455-1445c8652f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "basecamp": [
        "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Camping
    ],
    "safari": [
        "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # Safari/Wildlife
        "https://images.unsplash.com/photo-1547471080-7fc2caa7f5a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "sanctuary": [
        "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Wildlife
    ],

    # Spiritual
    "temple": [
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1514800790936-3914a229a43a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "ashram": [
        "https://images.unsplash.com/photo-1507676184212-d0330a15673c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1542642595-f9be8f94f9b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "shrine": [
        "https://images.unsplash.com/photo-1528310264028-c119934bf217?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "meditation": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],

    # Cultural / Heritage
    "museum": [
        "https://images.unsplash.com/photo-1518998053401-b2c395ffbb74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "heritage": [
        "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "theatre": [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Theatre/Stage
    ],
    "folk": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "artisans": [
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Art/Crafts
    ],
    "crafts": [
        "https://images.unsplash.com/photo-1544413660-299165566b1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "palace": [
        "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1588612154425-635b7e28b839?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],

    # Relaxation / Wellness
    "spa": [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1540555700478-4be289fbecef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "resort": [
        "https://images.unsplash.com/photo-1520116468816-95b69f847357?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "retreat": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "beach": [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],

    # Nature / Mountains
    "mountain": [
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "valley": [
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "forest": [
        "https://images.unsplash.com/photo-1441974231531-c8c8cf98f040?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "lake": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "garden": [
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Botanical/Tea garden
    ],

    # Urban / City
    "city": [
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "mall": [
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" # Shopping
    ],
    "market": [
        "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],

    # Food
    "cafe": [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "restaurant": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "food": [
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
}

# Fallback generic beautiful travel images if no keyword matches
fallback_images = [
    "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
]

def get_image_for_place(name, mood):
    name_lower = name.lower()
    
    # Check keywords in place name
    for keyword, urls in keyword_map.items():
        if keyword in name_lower:
            return urls[hash(name) % len(urls)]
            
    # If no specific keyword, map by mood as a backup
    mood_to_keyword = {
        "adventure": "adventure",
        "spiritual": "temple",
        "cultural": "heritage",
        "relaxation": "spa",
        "nature": "mountain",
        "wildlife": "safari",
        "urban": "city",
        "heritage": "palace",
        "beach": "beach",
        "mountain": "mountain",
        "food": "food",
        "art": "museum",
        "wellness": "meditation"
    }
    
    if mood.lower() in mood_to_keyword:
        kw = mood_to_keyword[mood.lower()]
        urls = keyword_map[kw]
        return urls[hash(name) % len(urls)]
        
    return fallback_images[hash(name) % len(fallback_images)]


def main():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        new_image = get_image_for_place(place['name'], place.get('mood', ''))
        place['image_url'] = new_image
        
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (place['image_url'], place['id']))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
    print("Updated images based on exact place name keywords and moods!")
