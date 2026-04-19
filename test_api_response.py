#!/usr/bin/env python3
"""Test API response format"""

import requests
import json

# Get the first analysis
response = requests.get(
    'http://localhost:8000/api/analysis/history?limit=1',
    headers={'Authorization': 'Bearer your_token_here'}  # We'll test without auth
)

print("API Response Status:", response.status_code)
print("API Response Headers:", dict(response.headers))
print("\nAPI Response Body:")
print(json.dumps(response.json(), indent=2, default=str))
