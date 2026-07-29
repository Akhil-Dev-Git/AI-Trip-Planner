import json
import sqlite3

# Mapping for the missing moods
mood_mapping = {
    "romantic": [
        "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1474533802364-585a9bc0ecf2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "family": [
        "https://images.unsplash.com/photo-1511895426328-dc8714191300?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "solo": [
        "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1516939884455-1445c8652f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "solo travel": [
        "https://images.unsplash.com/photo-1501555088652-021faa106b9b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "luxury": [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "budget": [
        "https://images.unsplash.com/photo-1553531384-397c80973a15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1526402324902-6c2e366838a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "budget-friendly": [
        "https://images.unsplash.com/photo-1553531384-397c80973a15?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "festival": [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
}

def main():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        mood = place.get('mood', '').lower()
        if mood in mood_mapping:
            urls = mood_mapping[mood]
            place['image_url'] = urls[hash(place['name']) % len(urls)]
            
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        mood = place.get('mood', '').lower()
        if mood in mood_mapping:
            cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (place['image_url'], place['id']))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
