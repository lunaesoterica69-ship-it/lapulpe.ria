#!/usr/bin/env python3
"""
La Pulpería Backend API Testing Suite
Tests auth endpoints and basic CRUD operations
"""

import requests
import json
import time
import sys
from datetime import datetime, timezone, timedelta

# Backend URL from frontend .env
BACKEND_URL = "https://market-makeover.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self):
        self.session_token = None
        self.user_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def create_test_user_and_session(self):
        """Create test user and session in MongoDB"""
        print("\n=== Creating Test User and Session ===")
        
        # Generate unique identifiers
        timestamp = int(time.time() * 1000)
        user_id = f"test-user-{timestamp}"
        session_token = f"test_session_{timestamp}"
        email = f"test.user.{timestamp}@example.com"
        
        # MongoDB command to create test data
        mongo_command = f'''
mongosh --eval "
use('test_database');
var userId = '{user_id}';
var sessionToken = '{session_token}';
var email = '{email}';
db.users.insertOne({{
  user_id: userId,
  email: email,
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  user_type: 'cliente',
  location: null,
  created_at: new Date()
}});
db.user_sessions.insertOne({{
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
}});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
print('Email: ' + email);
"
'''
        
        import subprocess
        try:
            result = subprocess.run(mongo_command, shell=True, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.session_token = session_token
                self.user_id = user_id
                self.log_result("Create Test User", True, f"Created user {user_id} with session {session_token}")
                print(f"MongoDB Output: {result.stdout}")
                return True
            else:
                self.log_result("Create Test User", False, "Failed to create test user", result.stderr)
                return False
        except Exception as e:
            self.log_result("Create Test User", False, f"Error creating test user: {str(e)}")
            return False
    
    def test_auth_session_endpoint(self):
        """Test POST /api/auth/session endpoint"""
        print("\n=== Testing Auth Session Endpoint ===")
        
        # This endpoint requires a valid session_id from Emergent Auth
        # Since we can't easily mock Emergent Auth, we'll test the endpoint structure
        url = f"{BACKEND_URL}/auth/session"
        
        # Test with invalid session_id
        payload = {"session_id": "invalid_session_id"}
        
        try:
            response = requests.post(url, json=payload, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Auth Session - Invalid ID", True, "Correctly rejected invalid session_id")
            elif response.status_code == 502:
                self.log_result("Auth Session - Service Error", True, "Auth service error (expected without valid Emergent Auth)")
            else:
                self.log_result("Auth Session - Invalid ID", False, f"Unexpected status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Auth Session - Invalid ID", False, f"Request failed: {str(e)}")
    
    def test_auth_me_endpoint(self):
        """Test GET /api/auth/me endpoint"""
        print("\n=== Testing Auth Me Endpoint ===")
        
        if not self.session_token:
            self.log_result("Auth Me", False, "No session token available")
            return
        
        url = f"{BACKEND_URL}/auth/me"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "user_id" in data and data["user_id"] == self.user_id:
                    self.log_result("Auth Me", True, f"Successfully retrieved user data for {self.user_id}")
                else:
                    self.log_result("Auth Me", False, "User data missing or incorrect", data)
            else:
                self.log_result("Auth Me", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Auth Me", False, f"Request failed: {str(e)}")
    
    def test_auth_logout_endpoint(self):
        """Test POST /api/auth/logout endpoint"""
        print("\n=== Testing Auth Logout Endpoint ===")
        
        if not self.session_token:
            self.log_result("Auth Logout", False, "No session token available")
            return
        
        url = f"{BACKEND_URL}/auth/logout"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            response = requests.post(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_result("Auth Logout", True, "Successfully logged out")
                else:
                    self.log_result("Auth Logout", False, "Unexpected response format", data)
            else:
                self.log_result("Auth Logout", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Auth Logout", False, f"Request failed: {str(e)}")
    
    def test_pulperias_endpoint(self):
        """Test GET /api/pulperias endpoint"""
        print("\n=== Testing Pulperias Endpoint ===")
        
        url = f"{BACKEND_URL}/pulperias"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Pulperias", True, f"Retrieved {len(data)} pulperias")
                else:
                    self.log_result("Get Pulperias", False, "Response is not a list", data)
            else:
                self.log_result("Get Pulperias", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Get Pulperias", False, f"Request failed: {str(e)}")
    
    def test_products_endpoint(self):
        """Test GET /api/products endpoint"""
        print("\n=== Testing Products Endpoint ===")
        
        url = f"{BACKEND_URL}/products"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Products", True, f"Retrieved {len(data)} products")
                else:
                    self.log_result("Get Products", False, "Response is not a list", data)
            else:
                self.log_result("Get Products", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Get Products", False, f"Request failed: {str(e)}")
    
    def test_jobs_endpoint(self):
        """Test GET /api/jobs endpoint"""
        print("\n=== Testing Jobs Endpoint ===")
        
        url = f"{BACKEND_URL}/jobs"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Get Jobs", True, f"Retrieved {len(data)} jobs")
                else:
                    self.log_result("Get Jobs", False, "Response is not a list", data)
            else:
                self.log_result("Get Jobs", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Get Jobs", False, f"Request failed: {str(e)}")
    
    def test_cors_headers(self):
        """Test CORS headers are present"""
        print("\n=== Testing CORS Headers ===")
        
        url = f"{BACKEND_URL}/pulperias"
        
        try:
            response = requests.options(url, timeout=10)
            
            cors_headers = [
                'Access-Control-Allow-Origin',
                'Access-Control-Allow-Methods',
                'Access-Control-Allow-Headers'
            ]
            
            missing_headers = []
            for header in cors_headers:
                if header not in response.headers:
                    missing_headers.append(header)
            
            if not missing_headers:
                self.log_result("CORS Headers", True, "All CORS headers present")
            else:
                self.log_result("CORS Headers", False, f"Missing headers: {missing_headers}")
                
        except requests.exceptions.RequestException as e:
            self.log_result("CORS Headers", False, f"Request failed: {str(e)}")
    
    def cleanup_test_data(self):
        """Clean up test data from MongoDB"""
        print("\n=== Cleaning Up Test Data ===")
        
        if not self.user_id:
            return
        
        mongo_command = f'''
mongosh --eval "
use('test_database');
db.users.deleteOne({{user_id: '{self.user_id}'}});
db.user_sessions.deleteOne({{user_id: '{self.user_id}'}});
print('Cleaned up test data for user: {self.user_id}');
"
'''
        
        import subprocess
        try:
            result = subprocess.run(mongo_command, shell=True, capture_output=True, text=True, timeout=30)
            if result.returncode == 0:
                self.log_result("Cleanup", True, f"Cleaned up test data for {self.user_id}")
            else:
                self.log_result("Cleanup", False, "Failed to cleanup test data", result.stderr)
        except Exception as e:
            self.log_result("Cleanup", False, f"Error during cleanup: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting La Pulpería Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Create test user and session
        if not self.create_test_user_and_session():
            print("❌ Failed to create test user. Skipping auth tests.")
        
        # Test auth endpoints
        self.test_auth_session_endpoint()
        self.test_auth_me_endpoint()
        self.test_auth_logout_endpoint()
        
        # Test basic endpoints
        self.test_pulperias_endpoint()
        self.test_products_endpoint()
        self.test_jobs_endpoint()
        
        # Test CORS
        self.test_cors_headers()
        
        # Cleanup
        self.cleanup_test_data()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("🧪 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for r in self.test_results if r["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        print("\n📊 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"  {status} {result['test']}: {result['message']}")

if __name__ == "__main__":
    tester = BackendTester()
    tester.run_all_tests()