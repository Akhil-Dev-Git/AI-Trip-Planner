import unittest
import os
import json
import sys
from unittest.mock import patch, MagicMock

# Ensure your-project-folder is in python path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))
import app

class TestAI(unittest.TestCase):
    def setUp(self):
        app.app.config['TESTING'] = True
        self.client = app.app.test_client()

    @patch('urllib.request.urlopen')
    def test_list_ai_models_success(self, mock_urlopen):
        # Mock successful response from local Ollama tags API
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps({
            "models": [
                {"name": "qwen3:8b"},
                {"name": "qwen2.5:1.5b"}
            ]
        }).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        response = self.client.get('/api/ai/models')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertTrue(data['online'])
        self.assertIn('qwen3:8b', data['models'])
        self.assertIn('qwen2.5:1.5b', data['models'])

    @patch('urllib.request.urlopen')
    def test_list_ai_models_offline_fallback(self, mock_urlopen):
        # Mock exception (Ollama offline)
        mock_urlopen.side_effect = Exception("Connection refused")

        response = self.client.get('/api/ai/models')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertFalse(data['online'])
        self.assertEqual(data['models'], ['llama3.1', 'phi4', 'mistral'])

    @patch('urllib.request.urlopen')
    def test_ai_chat_success(self, mock_urlopen):
        # Mock successful chat response from local Ollama chat API as an iterable of byte lines
        mock_response = MagicMock()
        mock_response.__iter__.return_value = [
            b'{"message": {"content": "Sure! Here is a 3-day itinerary for Kyoto..."}, "done": true}\n'
        ]
        mock_urlopen.return_value.__enter__.return_value = mock_response

        response = self.client.post('/api/ai/chat', json={
            "model": "qwen3:8b",
            "messages": [{"role": "user", "content": "Suggest a trip to Kyoto"}]
        })
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.mimetype, 'text/event-stream')
        
        # Decode the output stream and verify contents
        data = response.data.decode('utf-8')
        self.assertIn('data: ', data)
        self.assertIn('Sure! Here is a 3-day itinerary for Kyoto...', data)

if __name__ == '__main__':
    unittest.main()
