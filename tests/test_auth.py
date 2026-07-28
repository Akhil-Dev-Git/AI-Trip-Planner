import unittest
import sqlite3
import os
import json
import sys

# Ensure your-project-folder is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import app

class TestAuth(unittest.TestCase):
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
        
        # Configure app for testing
        app.app.config['TESTING'] = True
        app.app.config['SECRET_KEY'] = 'test-secret-key-12345'
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

    def test_register_login_flow(self):
        # 1. Register a new user
        response = self.client.post('/api/auth/register', json={
            'username': 'newuser',
            'password': 'password123',
            'email': 'newuser@example.com',
            'full_name': 'New User'
        })
        self.assertEqual(response.status_code, 201)
        res_json = response.get_json()
        self.assertIn('User registered successfully', res_json['message'])
        user_id = res_json['user_id']

        # 2. Register duplicate user
        response = self.client.post('/api/auth/register', json={
            'username': 'newuser',
            'password': 'password123',
            'email': 'newuser@example.com'
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('Username or email already exists', response.get_json()['error'])

        # 3. Login with correct credentials
        response = self.client.post('/api/auth/login', json={
            'username': 'newuser',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('token', data)
        self.assertEqual(data['user']['username'], 'newuser')
        token = data['token']

        # 4. Login with incorrect credentials
        response = self.client.post('/api/auth/login', json={
            'username': 'newuser',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 401)
        self.assertIn('Invalid username or password', response.get_json()['error'])

        # 5. Access protected route without token
        response = self.client.get('/api/user/me')
        self.assertEqual(response.status_code, 401)

        # 6. Access protected route with invalid token
        response = self.client.get('/api/user/me', headers={'Authorization': 'Bearer invalidtoken'})
        self.assertEqual(response.status_code, 401)

        # 7. Access protected route with valid token
        response = self.client.get('/api/user/me', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['username'], 'newuser')

        # 8. Create a trip with user token
        response = self.client.post('/api/trips', headers={'Authorization': f'Bearer {token}'}, json={
            'trip_name': 'My Paris Vacation',
            'destination': 'Paris',
            'start_date': '2026-08-01',
            'end_date': '2026-08-10',
            'number_of_travelers': 2
        })
        self.assertEqual(response.status_code, 201)
        trip_data = response.get_json()
        trip_id = trip_data['id']
        self.assertEqual(trip_data['trip_name'], 'My Paris Vacation')
        self.assertEqual(trip_data['user_id'], user_id)

        # 9. List trips - should show the created trip
        response = self.client.get('/api/trips', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 1)
        self.assertEqual(response.get_json()[0]['id'], trip_id)

        # 10. Register another user and verify they cannot see or modify the first user's trip
        response = self.client.post('/api/auth/register', json={
            'username': 'otheruser',
            'password': 'password123',
            'email': 'otheruser@example.com',
            'full_name': 'Other User'
        })
        self.assertEqual(response.status_code, 201)

        # Login other user
        response = self.client.post('/api/auth/login', json={
            'username': 'otheruser',
            'password': 'password123'
        })
        other_token = response.get_json()['token']

        # Other user lists trips - should be empty
        response = self.client.get('/api/trips', headers={'Authorization': f'Bearer {other_token}'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.get_json()), 0)

        # Other user tries to update newuser's trip
        response = self.client.put(f'/api/trips/{trip_id}', headers={'Authorization': f'Bearer {other_token}'}, json={
            'trip_name': 'Hacked Name',
            'destination': 'Paris'
        })
        self.assertEqual(response.status_code, 403)

        # Other user tries to delete newuser's trip
        response = self.client.delete(f'/api/trips/{trip_id}', headers={'Authorization': f'Bearer {other_token}'})
        self.assertEqual(response.status_code, 403)

        # Original user updates their trip successfully
        response = self.client.put(f'/api/trips/{trip_id}', headers={'Authorization': f'Bearer {token}'}, json={
            'trip_name': 'Updated Paris Vacation',
            'destination': 'Paris'
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()['trip_name'], 'Updated Paris Vacation')

        # Original user deletes their trip successfully
        response = self.client.delete(f'/api/trips/{trip_id}', headers={'Authorization': f'Bearer {token}'})
        self.assertEqual(response.status_code, 200)
