import json
import sqlite3

# Specific images mapped to the exact place name
# We convert names to lower case for case-insensitive matching
specific_images = {
    "london history museum 8": "https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "kumarakom history museum 1": "https://images.unsplash.com/photo-1568015707742-1cb24d275710?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "madurai folk museum 1": "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "bekal history museum 2": "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "vizag folk museum 2": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "kumarakom history museum ": "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "kumarakom history museum 3": "https://images.unsplash.com/photo-1574359411659-15573a27fd0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # in case they meant 3
    "madurai folk museum 3": "https://images.unsplash.com/photo-1533104816172-23f03b2a59a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "nainital folk museum 4": "https://images.unsplash.com/photo-1569931727725-7b1f5fc51586?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "agra folk museum": "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "agra folk museum 5": "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # cover possible number
    "venice history museum 9": "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "zurich folk museum 9": "https://images.unsplash.com/photo-1550983196-1262d1066cb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "london history museum 10": "https://images.unsplash.com/photo-1595166316279-d12fc45612fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "singapoor folk museum 10": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "singapore folk museum 10": "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", # spelling
    "wayanad temple complex 1": "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "coorg sacred shrine 1": "https://images.unsplash.com/photo-1514800790936-3914a229a43a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "munnar mindfulness ashram": "https://images.unsplash.com/photo-1507676184212-d0330a15673c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    "munnar mindfulness ashram 1": "https://images.unsplash.com/photo-1507676184212-d0330a15673c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
}

def main():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        name_lower = place['name'].lower().strip()
        for k, url in specific_images.items():
            if name_lower == k:
                place['image_url'] = url
                break
                
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        name_lower = place['name'].lower().strip()
        for k, url in specific_images.items():
            if name_lower == k:
                cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (url, place['id']))
                break
    conn.commit()
    conn.close()

if __name__ == '__main__':
    main()
