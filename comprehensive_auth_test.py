#!/usr/bin/env python3
"""
Comprehensive Auth Flow Test for La Pulpería
Tests the complete authentication workflow
"""

import requests
import json
import time
import subprocess
from datetime import datetime

BACKEND_URL = "https://premium-grocery-1.preview.emergentagent.com/api"

def create_test_user_with_pulperia():
    """Create a test user with pulperia type and create a pulperia"""
    print("🔧 Creating test user with pulperia type...")
    
    timestamp = int(time.time() * 1000)
    user_id = f"test-pulperia-{timestamp}"
    session_token = f"test_session_{timestamp}"
    email = f"test.pulperia.{timestamp}@example.com"
    
    mongo_command = f'''
mongosh --eval "
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
var email = '{email}';
db.users.insertOne({{
  user_id: userId,
  email: email,
  name: 'Test Pulperia Owner',
  picture: 'https://via.placeholder.com/150',
  user_type: 'pulperia',
  location: null,
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Created pulperia user: ' + userId);
"
'''
    
    try:
        result = subprocess.run(mongo_command, shell=True, capture_output=True, text=True, timeout=30)
        if result.returncode == 0:
            return user_id, session_token
        else:
            print(f"❌ Failed to create pulperia user: {result.stderr}")
            return None, None
    except Exception as e:
        print(f"❌ Error creating pulperia user: {str(e)}")
        return None, None

def test_protected_endpoints():
    """Test protected endpoints that require authentication"""
    print("\n🔐 Testing Protected Endpoints...")
    
    user_id, session_token = create_test_user_with_pulperia()
    if not user_id or not session_token:
        print("❌ Cannot test protected endpoints without valid session")
        return
    
    headers = {"Authorization": f"Bearer {session_token}"}
    
    # Test creating a pulperia
    print("📍 Testing pulperia creation...")
    pulperia_data = {
        "name": "Test Pulpería",
        "description": "Una pulpería de prueba",
        "address": "Calle Principal 123, Tegucigalpa",
        "location": {"lat": 14.0723, "lng": -87.1921},
        "phone": "+504 9999-9999",
        "email": "test@pulperia.com",
        "hours": "6:00 AM - 10:00 PM"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/pulperias", json=pulperia_data, headers=headers, timeout=10)
        if response.status_code == 200:
            pulperia = response.json()
            print(f"✅ Created pulperia: {pulperia['name']} (ID: {pulperia['pulperia_id']})")
            
            # Test creating a product
            print("🛒 Testing product creation...")
            product_data = {
                "name": "Coca Cola 600ml",
                "description": "Refresco de cola",
                "price": 25.0,
                "stock": 50,
                "category": "Bebidas"
            }
            
            product_response = requests.post(
                f"{BACKEND_URL}/products?pulperia_id={pulperia['pulperia_id']}", 
                json=product_data, 
                headers=headers, 
                timeout=10
            )
            
            if product_response.status_code == 200:
                product = product_response.json()
                print(f"✅ Created product: {product['name']} (ID: {product['product_id']})")
            else:
                print(f"❌ Failed to create product: {product_response.status_code} - {product_response.text}")
                
        else:
            print(f"❌ Failed to create pulperia: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    
    # Cleanup
    cleanup_command = f'''
mongosh --eval "
use('test_database');
db.users.deleteOne({{user_id: '{user_id}'}});
db.user_sessions.deleteOne({{user_id: '{user_id}'}});
db.pulperias.deleteMany({{owner_user_id: '{user_id}'}});
db.products.deleteMany({{pulperia_id: /test/}});
print('Cleaned up test data');
"
'''
    subprocess.run(cleanup_command, shell=True, capture_output=True, text=True, timeout=30)

def test_unauthorized_access():
    """Test that protected endpoints properly reject unauthorized requests"""
    print("\n🚫 Testing Unauthorized Access...")
    
    # Test without any authorization
    try:
        response = requests.get(f"{BACKEND_URL}/auth/me", timeout=10)
        if response.status_code == 401:
            print("✅ Correctly rejected request without authorization")
        else:
            print(f"❌ Expected 401, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    
    # Test with invalid token
    try:
        headers = {"Authorization": "Bearer invalid_token"}
        response = requests.get(f"{BACKEND_URL}/auth/me", headers=headers, timeout=10)
        if response.status_code == 401:
            print("✅ Correctly rejected request with invalid token")
        else:
            print(f"❌ Expected 401, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")

def test_api_error_handling():
    """Test API error handling"""
    print("\n⚠️ Testing Error Handling...")
    
    # Test non-existent endpoint
    try:
        response = requests.get(f"{BACKEND_URL}/nonexistent", timeout=10)
        if response.status_code == 404:
            print("✅ Correctly returned 404 for non-existent endpoint")
        else:
            print(f"❌ Expected 404, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
    
    # Test invalid JSON
    try:
        headers = {"Content-Type": "application/json"}
        response = requests.post(f"{BACKEND_URL}/auth/session", data="invalid json", headers=headers, timeout=10)
        if response.status_code in [400, 422]:
            print("✅ Correctly handled invalid JSON")
        else:
            print(f"❌ Expected 400/422, got {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")

if __name__ == "__main__":
    print("🧪 Comprehensive La Pulpería Auth Flow Test")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    test_protected_endpoints()
    test_unauthorized_access()
    test_api_error_handling()
    
    print("\n✅ Comprehensive testing completed!")