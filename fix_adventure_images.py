import json
import sqlite3

# Highly specific adventure mapping
adventure_map = {
    "rafting": "https://images.unsplash.com/photo-1533692328991-08159ff19fca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "climbing": "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "trekking": "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "ski": "https://images.unsplash.com/photo-1551524164-687a55dd1126?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "canyon": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "basecamp": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "zipline": "https://images.unsplash.com/photo-1522163182402-834f871fd851?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # fallback to climbing for action
    "expedition": "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # fallback to trekking
    "thrill": "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # fallback to canyon/hiking
    "park": "https://images.unsplash.com/photo-1533692328991-08159ff19fca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # fallback to rafting/action
}

def main():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        if place.get('mood', '').lower() == 'adventure':
            name_lower = place['name'].lower()
            assigned = False
            for kw, url in adventure_map.items():
                if kw in name_lower:
                    place['image_url'] = url
                    assigned = True
                    break
            
            # If no keyword matched, assign a random one but deterministically
            if not assigned:
                keys = list(adventure_map.keys())
                url = adventure_map[keys[hash(place['name']) % len(keys)]]
                place['image_url'] = url
                
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        if place.get('mood', '').lower() == 'adventure':
            cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (place['image_url'], place['id']))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
