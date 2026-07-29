import json
import sqlite3

land_types = {
    "snow": [
        "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "hills": [
        "https://images.unsplash.com/photo-1441974231531-c8c8cf98f040?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1426604966848-d7adac402bff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "beach": [
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1519046904884-53103b34b206?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1520116468816-95b69f847357?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "desert": [
        "https://images.unsplash.com/photo-1473580044384-7ba9967e16a0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1509316785289-025f5b846b35?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1469521669194-babb45599def?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1448834988775-8eb3442a0337?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1504913659239-6abc96eb738b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "historic": [
        "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1588612154425-635b7e28b839?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "city": [
        "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1449844908441-8829872d2607?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
    "river_lake": [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1499810631641-541e76d678a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1470071532822-0445fb621ce3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1531816458010-fb7685eec9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1521206671438-3ee7cd0214a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ]
}

location_map = {
    'Leh, Ladakh, India': 'snow', 'Gulmarg, Jammu & Kashmir, India': 'snow', 'Zermatt, Switzerland': 'snow', 'Manali, Himachal Pradesh, India': 'snow',
    'Wayanad, Kerala, India': 'hills', 'Munnar, Kerala, India': 'hills', 'Coorg, Karnataka, India': 'hills', 'Kodaikanal, Tamil Nadu, India': 'hills', 'Ooty, Tamil Nadu, India': 'hills', 'Shimla, Himachal Pradesh, India': 'hills', 'Nainital, Uttarakhand, India': 'hills', 'Dharamshala, Himachal Pradesh, India': 'hills', 'Bir Billing, Himachal Pradesh, India': 'hills', 'Jim Corbett, Uttarakhand, India': 'hills', 'Dandeli, Karnataka, India': 'hills',
    'Varkala, Kerala, India': 'beach', 'Bekal, Kerala, India': 'beach', 'Gokarna, Karnataka, India': 'beach', 'Maldives': 'beach', 'Bali, Indonesia': 'beach', 'Phuket, Thailand': 'beach', 'Pondicherry, India': 'beach', 'Sydney, Australia': 'beach', 'Vizag, Andhra Pradesh, India': 'beach', 'Chennai, Tamil Nadu, India': 'beach',
    'Jaisalmer, Rajasthan, India': 'desert', 'Jodhpur, Rajasthan, India': 'desert', 'Pushkar, Rajasthan, India': 'desert', 'Marrakech, Morocco': 'desert', 'Dubai, UAE': 'desert',
    'Hampi, Karnataka, India': 'historic', 'Agra, Uttar Pradesh, India': 'historic', 'Jaipur, Rajasthan, India': 'historic', 'Udaipur, Rajasthan, India': 'historic', 'Rome, Italy': 'historic', 'Florence, Italy': 'historic', 'Kyoto, Japan': 'historic', 'Varanasi, Uttar Pradesh, India': 'historic', 'Madurai, Tamil Nadu, India': 'historic', 'Mysore, Karnataka, India': 'historic', 'Rameswaram, Tamil Nadu, India': 'historic', 'Amritsar, Punjab, India': 'historic',
    'Bangalore, Karnataka, India': 'city', 'Delhi, India': 'city', 'Hyderabad, Telangana, India': 'city', 'Chandigarh, India': 'city', 'London, UK': 'city', 'Paris, France': 'city', 'New York, USA': 'city', 'Tokyo, Japan': 'city', 'Singapore': 'city', 'Bangkok, Thailand': 'city', 'Cape Town, South Africa': 'city', 'Zurich, Switzerland': 'city', 'Coimbatore, Tamil Nadu, India': 'city',
    'Kumarakom, Kerala, India': 'river_lake', 'Srinagar, Jammu & Kashmir, India': 'river_lake', 'Venice, Italy': 'river_lake', 'Rishikesh, Uttarakhand, India': 'river_lake', 'Grand Canyon, USA': 'river_lake'
}

def update_by_land_type():
    with open('places.json', 'r') as f:
        places = json.load(f)
        
    for place in places:
        loc = place.get('location')
        land_type = location_map.get(loc, 'hills') # default to hills
        pool = land_types[land_type]
        idx = hash(place['name'] + place['id']) % len(pool)
        place['image_url'] = pool[idx]
        
    with open('places.json', 'w') as f:
        json.dump(places, f, indent=2)
        
    # Also update sqlite
    conn = sqlite3.connect('trips.db')
    cursor = conn.cursor()
    for place in places:
        cursor.execute("UPDATE places SET image_url = ? WHERE id = ?", (place['image_url'], place['id']))
    conn.commit()
    conn.close()

if __name__ == '__main__':
    update_by_land_type()
    print("Updated images based on land type!")
