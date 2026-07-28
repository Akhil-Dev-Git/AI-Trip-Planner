import unittest
import sqlite3
import os
import json
import sys

# Ensure your-project-folder is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import app

class TestNavigation(unittest.TestCase):
    def setUp(self):
        # Use a temporary test database for tests
        self.test_db_path = os.path.join(os.path.dirname(__file__), 'test_trips.db')
        
        # Patch app.DB_PATH and get_db_connection to connect to test_trips.db
        self.original_db_path = app.DB_PATH
        app.DB_PATH = self.test_db_path
        
        self.original_get_db_connection = app.get_db_connection
        def get_test_db_connection():
            conn = sqlite3.connect(self.test_db_path)
            conn.row_factory = sqlite3.Row
            return conn
        app.get_db_connection = get_test_db_connection
        
        # Initialize test database schema
        app.init_db()
        
        # Add test places to the database
        conn = get_test_db_connection()
        cursor = conn.cursor()
        cursor.execute('''
        INSERT INTO places (id, name, latitude, longitude, mood, region)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', ('place1', 'Trivandrum Beach', 8.5241, 76.9366, 'beach', 'south_india'))
        cursor.execute('''
        INSERT INTO places (id, name, latitude, longitude, mood, region)
        VALUES (?, ?, ?, ?, ?, ?)
        ''', ('place2', 'Munnar Hills', 10.0889, 77.0595, 'nature', 'south_india'))
        conn.commit()
        conn.close()
        
        # Configure app for testing
        app.app.config['TESTING'] = True
        self.client = app.app.test_client()

    def tearDown(self):
        # Restore original variables
        app.DB_PATH = self.original_db_path
        app.get_db_connection = self.original_get_db_connection
        # Clean up test database file
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except Exception:
                pass

    def test_navigation_directions(self):
        # Test navigation calculations between place1 and place2
        response = self.client.get('/api/navigation/directions?origin_id=place1&destination_id=place2')
        self.assertEqual(response.status_code, 200)
        
        data = response.get_json()
        self.assertIn('distance_km', data)
        self.assertIn('modes', data)
        self.assertIn('steps', data)
        
        # Verify distance calculations
        self.assertGreater(data['distance_km'], 0)
        self.assertEqual(data['origin']['name'], 'Trivandrum Beach')
        self.assertEqual(data['destination']['name'], 'Munnar Hills')
        
        # Verify modes exist
        self.assertIn('driving', data['modes'])
        self.assertIn('bus', data['modes'])
        self.assertIn('train', data['modes'])

        # Test validation error on missing destination
        response = self.client.get('/api/navigation/directions?origin_id=place1')
        self.assertEqual(response.status_code, 400)
        self.assertIn('Destination location could not be resolved', response.get_json()['error'])
