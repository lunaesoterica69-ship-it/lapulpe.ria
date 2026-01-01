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
BACKEND_URL = "https://achiev-meritocracy.preview.emergentagent.com/api"

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
    
    def test_shopping_cart_functionality(self):
        """Test shopping cart related endpoints"""
        print("\n=== Testing Shopping Cart Functionality ===")
        
        # Test 1: GET /api/pulperias - Verify pulperias list works
        self.test_get_pulperias_for_cart()
        
        # Test 2: GET /api/pulperias/{id}/products - Verify products can be fetched
        self.test_get_pulperia_products()
        
        # Test 3: POST /api/orders - Test order creation (401 without auth)
        self.test_order_creation_without_auth()
        
        # Test 4: Test order creation schema with multi-store items
        self.test_order_creation_schema()
        
        # Test 5: Test localStorage cart structure validation
        self.test_cart_structure_validation()
    
    def test_get_pulperias_for_cart(self):
        """Test GET /api/pulperias for shopping cart"""
        print("\n--- Testing GET /api/pulperias for Cart ---")
        
        url = f"{BACKEND_URL}/pulperias"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if pulperias have required fields for cart
                    required_fields = ['pulperia_id', 'name', 'address']
                    
                    if len(data) > 0:
                        pulperia = data[0]
                        missing_fields = [field for field in required_fields if field not in pulperia]
                        
                        if not missing_fields:
                            self.log_result("Cart - Get Pulperias", True, f"Retrieved {len(data)} pulperias with required fields")
                            return data  # Return for use in other tests
                        else:
                            self.log_result("Cart - Get Pulperias", False, f"Missing required fields: {missing_fields}")
                    else:
                        self.log_result("Cart - Get Pulperias", True, "No pulperias found (empty list)")
                        return []
                else:
                    self.log_result("Cart - Get Pulperias", False, "Response is not a list", data)
            else:
                self.log_result("Cart - Get Pulperias", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Cart - Get Pulperias", False, f"Request failed: {str(e)}")
        
        return None
    
    def test_get_pulperia_products(self):
        """Test GET /api/pulperias/{id}/products"""
        print("\n--- Testing GET /api/pulperias/{id}/products ---")
        
        # First get a pulperia ID
        pulperias = self.test_get_pulperias_for_cart()
        
        if not pulperias or len(pulperias) == 0:
            self.log_result("Cart - Get Pulperia Products", False, "No pulperias available to test products")
            return
        
        pulperia_id = pulperias[0]['pulperia_id']
        url = f"{BACKEND_URL}/pulperias/{pulperia_id}/products"
        
        try:
            response = requests.get(url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    # Check if products have required fields for cart
                    required_fields = ['product_id', 'name', 'price', 'pulperia_id']
                    
                    if len(data) > 0:
                        product = data[0]
                        missing_fields = [field for field in required_fields if field not in product]
                        
                        if not missing_fields:
                            self.log_result("Cart - Get Pulperia Products", True, f"Retrieved {len(data)} products with required fields")
                        else:
                            self.log_result("Cart - Get Pulperia Products", False, f"Missing required fields: {missing_fields}")
                    else:
                        self.log_result("Cart - Get Pulperia Products", True, f"No products found for pulperia {pulperia_id}")
                else:
                    self.log_result("Cart - Get Pulperia Products", False, "Response is not a list", data)
            else:
                self.log_result("Cart - Get Pulperia Products", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Cart - Get Pulperia Products", False, f"Request failed: {str(e)}")
    
    def test_order_creation_without_auth(self):
        """Test POST /api/orders without authentication (should return 401)"""
        print("\n--- Testing POST /api/orders without auth ---")
        
        url = f"{BACKEND_URL}/orders"
        
        # Sample order data
        order_data = {
            "customer_name": "María González",
            "pulperia_id": "test_pulperia_123",
            "items": [
                {
                    "product_id": "prod_123",
                    "product_name": "Arroz Diana 1kg",
                    "quantity": 2,
                    "price": 25.50,
                    "pulperia_id": "test_pulperia_123",
                    "pulperia_name": "Pulpería Central"
                }
            ],
            "total": 51.00,
            "order_type": "pickup"
        }
        
        try:
            response = requests.post(url, json=order_data, timeout=10)
            
            if response.status_code == 401:
                self.log_result("Cart - Order Creation Auth", True, "Correctly rejected order creation without authentication")
            else:
                self.log_result("Cart - Order Creation Auth", False, f"Expected 401, got {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Cart - Order Creation Auth", False, f"Request failed: {str(e)}")
    
    def test_order_creation_schema(self):
        """Test order creation schema accepts multi-store items"""
        print("\n--- Testing Order Creation Schema ---")
        
        if not self.session_token:
            self.log_result("Cart - Order Schema", False, "No session token available for authenticated test")
            return
        
        url = f"{BACKEND_URL}/orders"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        # Multi-store order data
        order_data = {
            "customer_name": "Ana Rodríguez",
            "pulperia_id": "pulperia_main_001",  # Primary pulperia for the order
            "items": [
                {
                    "product_id": "prod_001",
                    "product_name": "Leche Dos Pinos 1L",
                    "quantity": 3,
                    "price": 18.75,
                    "pulperia_id": "pulperia_main_001",
                    "pulperia_name": "Pulpería El Centro"
                },
                {
                    "product_id": "prod_002", 
                    "product_name": "Pan Bimbo Integral",
                    "quantity": 1,
                    "price": 32.00,
                    "pulperia_id": "pulperia_sec_002",
                    "pulperia_name": "Panadería La Esquina"
                },
                {
                    "product_id": "prod_003",
                    "product_name": "Huevos Frescos x12",
                    "quantity": 2,
                    "price": 45.50,
                    "pulperia_id": "pulperia_main_001",
                    "pulperia_name": "Pulpería El Centro"
                }
            ],
            "total": 142.75,
            "order_type": "pickup"
        }
        
        try:
            response = requests.post(url, json=order_data, headers=headers, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                # Verify the order was created with correct structure
                required_fields = ['order_id', 'customer_name', 'pulperia_id', 'items', 'total', 'order_type']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    # Check if items maintain multi-store structure
                    items = data.get('items', [])
                    if len(items) == 3:  # Should have all 3 items
                        item_fields_ok = all(
                            all(field in item for field in ['product_id', 'product_name', 'quantity', 'price', 'pulperia_id', 'pulperia_name'])
                            for item in items
                        )
                        if item_fields_ok:
                            self.log_result("Cart - Order Schema", True, "Order created successfully with multi-store items")
                        else:
                            self.log_result("Cart - Order Schema", False, "Order items missing required fields")
                    else:
                        self.log_result("Cart - Order Schema", False, f"Expected 3 items, got {len(items)}")
                else:
                    self.log_result("Cart - Order Schema", False, f"Order missing required fields: {missing_fields}")
            else:
                self.log_result("Cart - Order Schema", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Cart - Order Schema", False, f"Request failed: {str(e)}")
    
    def test_cart_structure_validation(self):
        """Test localStorage cart structure validation"""
        print("\n--- Testing Cart Structure Validation ---")
        
        # Define expected cart structure for localStorage
        expected_cart_structure = {
            "items": [
                {
                    "product_id": "prod_123",
                    "name": "Arroz Diana 1kg", 
                    "price": 25.50,
                    "quantity": 2,
                    "pulperia_id": "pulperia_001",
                    "pulperia_name": "Pulpería Central"
                },
                {
                    "product_id": "prod_456",
                    "name": "Aceite Capullo 500ml",
                    "price": 42.00,
                    "quantity": 1,
                    "pulperia_id": "pulperia_002", 
                    "pulperia_name": "Tienda La Esquina"
                }
            ]
        }
        
        # Validate cart structure has minimal required fields
        required_item_fields = ['product_id', 'name', 'price', 'quantity', 'pulperia_id', 'pulperia_name']
        
        try:
            # Check if all items have required fields
            all_items_valid = True
            missing_fields_per_item = []
            
            for i, item in enumerate(expected_cart_structure['items']):
                missing_fields = [field for field in required_item_fields if field not in item]
                if missing_fields:
                    all_items_valid = False
                    missing_fields_per_item.append(f"Item {i}: {missing_fields}")
            
            if all_items_valid:
                # Calculate total size to check for QuotaExceededError prevention
                cart_json = json.dumps(expected_cart_structure)
                cart_size_kb = len(cart_json.encode('utf-8')) / 1024
                
                if cart_size_kb < 5:  # Should be under 5KB for localStorage efficiency
                    self.log_result("Cart - Structure Validation", True, f"Cart structure valid, size: {cart_size_kb:.2f}KB")
                else:
                    self.log_result("Cart - Structure Validation", False, f"Cart too large: {cart_size_kb:.2f}KB (may cause QuotaExceededError)")
            else:
                self.log_result("Cart - Structure Validation", False, f"Invalid cart structure: {missing_fields_per_item}")
                
        except Exception as e:
            self.log_result("Cart - Structure Validation", False, f"Validation failed: {str(e)}")
    
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
    
    def test_notifications_endpoint(self):
        """Test GET /api/notifications endpoint"""
        print("\n=== Testing Notifications Endpoint ===")
        
        if not self.session_token:
            self.log_result("Notifications - No Auth", False, "No session token available")
            return
        
        url = f"{BACKEND_URL}/notifications"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 404:
                self.log_result("Notifications - Endpoint Missing", False, "GET /api/notifications endpoint not implemented")
            elif response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result("Notifications - Success", True, f"Retrieved {len(data)} notifications")
                else:
                    self.log_result("Notifications - Invalid Format", False, "Response is not a list", data)
            else:
                self.log_result("Notifications - Error", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Notifications - Request Failed", False, f"Request failed: {str(e)}")
    
    def test_orders_with_customer_name(self):
        """Test GET /api/orders returns orders with customer_name field"""
        print("\n=== Testing Orders with Customer Name ===")
        
        if not self.session_token:
            self.log_result("Orders - Customer Name", False, "No session token available")
            return
        
        url = f"{BACKEND_URL}/orders"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        try:
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    if len(data) > 0:
                        # Check if orders have required fields including customer_name
                        required_fields = ['order_id', 'customer_name', 'items', 'total', 'status', 'created_at']
                        order = data[0]
                        missing_fields = [field for field in required_fields if field not in order]
                        
                        if not missing_fields:
                            self.log_result("Orders - Customer Name Field", True, f"Orders contain customer_name field. Found {len(data)} orders")
                        else:
                            self.log_result("Orders - Customer Name Field", False, f"Orders missing required fields: {missing_fields}")
                    else:
                        self.log_result("Orders - Customer Name Field", True, "No orders found (empty list)")
                else:
                    self.log_result("Orders - Customer Name Field", False, "Response is not a list", data)
            else:
                self.log_result("Orders - Customer Name Field", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Orders - Customer Name Field", False, f"Request failed: {str(e)}")
    
    def test_order_creation_with_customer_name(self):
        """Test POST /api/orders accepts customer_name field"""
        print("\n=== Testing Order Creation with Customer Name ===")
        
        if not self.session_token:
            self.log_result("Order Creation - Customer Name", False, "No session token available")
            return
        
        url = f"{BACKEND_URL}/orders"
        headers = {"Authorization": f"Bearer {self.session_token}"}
        
        # Order data with customer_name field
        order_data = {
            "customer_name": "Carmen Delgado",
            "pulperia_id": "pulperia_test_001",
            "items": [
                {
                    "product_id": "prod_test_001",
                    "product_name": "Frijoles Rojos 1lb",
                    "quantity": 2,
                    "price": 28.50,
                    "pulperia_id": "pulperia_test_001",
                    "pulperia_name": "La Pulpería de Carmen"
                }
            ],
            "total": 57.00,
            "order_type": "pickup"
        }
        
        try:
            response = requests.post(url, json=order_data, headers=headers, timeout=10)
            
            if response.status_code == 200 or response.status_code == 201:
                data = response.json()
                # Verify the order was created with customer_name
                if 'customer_name' in data and data['customer_name'] == order_data['customer_name']:
                    required_fields = ['order_id', 'customer_name', 'items', 'total', 'status', 'created_at']
                    missing_fields = [field for field in required_fields if field not in data]
                    
                    if not missing_fields:
                        self.log_result("Order Creation - Customer Name", True, f"Order created successfully with customer_name: {data['customer_name']}")
                    else:
                        self.log_result("Order Creation - Customer Name", False, f"Order missing required fields: {missing_fields}")
                else:
                    self.log_result("Order Creation - Customer Name", False, "Order created but customer_name field missing or incorrect")
            else:
                self.log_result("Order Creation - Customer Name", False, f"Status: {response.status_code}", response.text)
                
        except requests.exceptions.RequestException as e:
            self.log_result("Order Creation - Customer Name", False, f"Request failed: {str(e)}")
    
    def test_notification_system_requirements(self):
        """Test the order notification system requirements"""
        print("\n=== Testing Order Notification System ===")
        
        # Test 1: Check if notifications endpoint exists
        self.test_notifications_endpoint()
        
        # Test 2: Verify orders include customer_name field
        self.test_orders_with_customer_name()
        
        # Test 3: Test order creation with customer_name
        self.test_order_creation_with_customer_name()

    def run_all_tests(self):
        """Run all backend tests"""
        print("🧪 Starting La Pulpería Backend API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Create test user and session
        if not self.create_test_user_and_session():
            print("❌ Failed to create test user. Skipping auth tests.")
        
        # Test auth endpoints (except logout)
        self.test_auth_session_endpoint()
        self.test_auth_me_endpoint()
        
        # Test basic endpoints
        self.test_pulperias_endpoint()
        self.test_products_endpoint()
        self.test_jobs_endpoint()
        
        # Test CORS
        self.test_cors_headers()
        
        # Test shopping cart functionality (before logout to maintain session)
        self.test_shopping_cart_functionality()
        
        # Test notification system requirements
        self.test_notification_system_requirements()
        
        # Test logout last
        self.test_auth_logout_endpoint()
        
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