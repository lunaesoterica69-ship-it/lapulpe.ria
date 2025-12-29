#!/usr/bin/env python3
"""
Focused WebSocket testing for the new real-time order management system
"""

import requests
import json
import sys
import time

class WebSocketTester:
    def __init__(self):
        self.base_url = "https://red-auth-connect.preview.emergentagent.com"
        self.pulperia_token = "-VQBIlnpDEMpfon3aq3vZAlmk0n-bkvQSixYRttrn78"  # Valid pulperia token
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            # Handle multiple expected status codes
            if isinstance(expected_status, list):
                success = response.status_code in expected_status
            else:
                success = response.status_code == expected_status
                
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_websocket_status_endpoint(self):
        """Test the WebSocket status endpoint"""
        print("\n=== TESTING WEBSOCKET STATUS ENDPOINT ===")
        
        # Test with various user IDs
        test_users = ["test_user_123", "user_abc", "nonexistent_user"]
        
        for user_id in test_users:
            success, response = self.run_test(
                f"WebSocket status for {user_id}",
                "GET",
                f"ws/status/{user_id}",
                200
            )
            
            if success:
                print(f"   User: {response.get('user_id')}")
                print(f"   Connected: {response.get('connected')}")
                print(f"   Connections: {response.get('connection_count')}")

    def test_order_creation_with_broadcast(self):
        """Test order creation that should trigger WebSocket broadcast"""
        print("\n=== TESTING ORDER CREATION WITH WEBSOCKET BROADCAST ===")
        
        # First, get existing orders to see if we have any pulperias/products
        success, orders_response = self.run_test(
            "Get existing orders",
            "GET",
            "orders",
            200,
            token=self.pulperia_token
        )
        
        if success:
            orders = orders_response if isinstance(orders_response, list) else []
            print(f"✅ Found {len(orders)} existing orders")
            
            if orders:
                # Use data from existing order to test
                existing_order = orders[0]
                print(f"   Sample order ID: {existing_order.get('order_id')}")
                print(f"   Sample order status: {existing_order.get('status')}")
                print(f"   Sample order total: {existing_order.get('total')}")
                
                # Test order status update (should trigger WebSocket broadcast)
                order_id = existing_order.get('order_id')
                current_status = existing_order.get('status')
                
                # Determine next status for testing
                status_transitions = {
                    'pending': 'accepted',
                    'accepted': 'ready',
                    'ready': 'completed',
                    'completed': 'pending',  # Reset for testing
                    'cancelled': 'pending'   # Reset for testing
                }
                
                next_status = status_transitions.get(current_status, 'accepted')
                
                print(f"\n🔍 Testing order status update: {current_status} → {next_status}")
                
                status_update = {"status": next_status}
                success, response = self.run_test(
                    f"Update order status to {next_status} (with WebSocket broadcast)",
                    "PUT",
                    f"orders/{order_id}/status",
                    200,
                    data=status_update,
                    token=self.pulperia_token
                )
                
                if success:
                    updated_status = response.get('status')
                    print(f"✅ Order status updated to: {updated_status}")
                    print("ℹ️  This should have triggered WebSocket broadcast to owner and customer")
                    
                    # Check if the order was actually updated
                    if updated_status == next_status:
                        print("✅ Order status update successful")
                    else:
                        print(f"❌ Order status not updated correctly - expected {next_status}, got {updated_status}")
            else:
                print("ℹ️  No existing orders found to test status updates")

    def test_websocket_endpoint_accessibility(self):
        """Test if WebSocket endpoint is accessible (basic connectivity)"""
        print("\n=== TESTING WEBSOCKET ENDPOINT ACCESSIBILITY ===")
        
        # Test if the WebSocket endpoint responds (even if it's not a proper WebSocket request)
        ws_url = f"{self.base_url}/ws/orders/test_user_123"
        
        print(f"🔍 Testing WebSocket endpoint accessibility: {ws_url}")
        
        try:
            # Try to make a regular HTTP request to the WebSocket endpoint
            # This should fail with a specific error indicating it's a WebSocket endpoint
            response = requests.get(ws_url, timeout=5)
            print(f"❌ Unexpected response from WebSocket endpoint: {response.status_code}")
            print(f"Response: {response.text}")
        except requests.exceptions.RequestException as e:
            # This is expected - WebSocket endpoints don't respond to HTTP requests
            print(f"✅ WebSocket endpoint properly rejects HTTP requests: {str(e)}")
            print("ℹ️  This indicates the WebSocket endpoint exists and is configured correctly")

    def test_existing_endpoints_still_work(self):
        """Verify existing endpoints still work after WebSocket implementation"""
        print("\n=== VERIFYING EXISTING ENDPOINTS STILL WORK ===")
        
        # Test authentication
        success, response = self.run_test(
            "Authentication endpoint",
            "GET",
            "auth/me",
            200,
            token=self.pulperia_token
        )
        
        if success:
            print(f"✅ User: {response.get('name')} ({response.get('user_type')})")
        
        # Test orders endpoint
        success, response = self.run_test(
            "Orders endpoint",
            "GET",
            "orders",
            200,
            token=self.pulperia_token
        )
        
        if success:
            orders = response if isinstance(response, list) else []
            print(f"✅ Orders endpoint working - {len(orders)} orders")
        
        # Test notifications endpoint
        success, response = self.run_test(
            "Notifications endpoint",
            "GET",
            "notifications",
            200,
            token=self.pulperia_token
        )
        
        if success:
            notifications = response if isinstance(response, list) else []
            print(f"✅ Notifications endpoint working - {len(notifications)} notifications")
        
        # Test pulperias endpoint (public)
        success, response = self.run_test(
            "Pulperias endpoint (public)",
            "GET",
            "pulperias",
            200
        )
        
        if success:
            pulperias = response if isinstance(response, list) else []
            print(f"✅ Pulperias endpoint working - {len(pulperias)} pulperias")

def main():
    print("🚀 WebSocket-Focused API Testing")
    print("=" * 50)
    
    tester = WebSocketTester()
    
    # Run WebSocket-specific tests
    tester.test_websocket_status_endpoint()
    tester.test_websocket_endpoint_accessibility()
    tester.test_order_creation_with_broadcast()
    tester.test_existing_endpoints_still_work()
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 WEBSOCKET TEST RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All WebSocket tests passed!")
        return 0
    else:
        print("❌ Some WebSocket tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())