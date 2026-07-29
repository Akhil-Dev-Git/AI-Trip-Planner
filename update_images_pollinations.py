import json
import sqlite3
import urllib.parse

def assign_pollinations_images():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        # Construct a high-quality prompt that forces a realistic photograph of the exact place
        # The prompt uses the place name and location to be extremely specific.
        prompt = f"Beautiful high quality realistic travel photography of {place['name']} in {place['location']}, scenic landmark"
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Use a deterministic seed based on the place ID so it doesn't change on every reload, but is unique per place
        seed = hash(place['id'] + place['name']) % 1000000
        
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=800&height=600&nologo=true&seed={seed}"
        
        place['image_url'] = url
        
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    # Also update sqlite directly
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (place['image_url'], place['id']))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    assign_pollinations_images()
    print("Successfully updated places.json and trips.db with specific Pollinations.ai images.")
