#!/usr/bin/env python3
"""
Critical test for order status update functionality
This tests the main bug fix mentioned in the review request
"""

import requests
import json

BASE_URL = "https://lapulperia-app.preview.emergentagent.com"
PULPERIA_TOKEN = "test_session_pulperia_1766943109361"

def test_order_status_transitions():
    """Test the critical order status update bug fix"""
    print("🔥 TESTING CRITICAL ORDER STATUS UPDATE BUG FIX")
    print("=" * 60)
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {PULPERIA_TOKEN}'
    }
    
    # First, let's get existing orders to test with
    print("\n1. Getting existing orders...")
    response = requests.get(f"{BASE_URL}/api/orders", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        orders = response.json()
        print(f"Found {len(orders)} orders")
        
        # Find a pending order to test with
        pending_orders = [o for o in orders if o.get('status') == 'pending']
        
        if pending_orders:
            test_order = pending_orders[0]
            order_id = test_order['order_id']
            print(f"Testing with order: {order_id}")
            
            # Test status transitions
            transitions = [
                ('pending', 'accepted'),
                ('accepted', 'ready'), 
                ('ready', 'completed')
            ]
            
            for from_status, to_status in transitions:
                print(f"\n2. Testing transition: {from_status} → {to_status}")
                
                status_data = {"status": to_status}
                response = requests.put(
                    f"{BASE_URL}/api/orders/{order_id}/status",
                    json=status_data,
                    headers=headers
                )
                
                print(f"Status: {response.status_code}")
                if response.status_code == 200:
                    result = response.json()
                    actual_status = result.get('status')
                    print(f"✅ SUCCESS: Order status updated to '{actual_status}'")
                    
                    if actual_status == to_status:
                        print(f"✅ VERIFIED: Status correctly set to '{to_status}'")
                    else:
                        print(f"❌ ERROR: Expected '{to_status}', got '{actual_status}'")
                else:
                    print(f"❌ FAILED: {response.text}")
                    return False
            
            print("\n🎉 ALL ORDER STATUS TRANSITIONS WORKING!")
            return True
        else:
            print("No pending orders found. Creating a test order...")
            # We would need a cliente token to create an order
            print("❌ Cannot test without a valid cliente token")
            return False
    else:
        print(f"❌ Failed to get orders: {response.text}")
        return False

def test_notifications_endpoint():
    """Test the notifications endpoint"""
    print("\n🔥 TESTING NOTIFICATIONS ENDPOINT")
    print("=" * 40)
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {PULPERIA_TOKEN}'
    }
    
    response = requests.get(f"{BASE_URL}/api/notifications", headers=headers)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        notifications = response.json()
        print(f"✅ SUCCESS: Received {len(notifications)} notifications")
        
        for i, notif in enumerate(notifications[:3]):
            print(f"  {i+1}. {notif.get('title', 'N/A')}: {notif.get('message', 'N/A')}")
        
        return True
    else:
        print(f"❌ FAILED: {response.text}")
        return False

def main():
    print("🚀 CRITICAL BUG FIX TESTING")
    print("Testing the order status update functionality that was broken")
    print("=" * 70)
    
    # Test order status transitions
    status_test_passed = test_order_status_transitions()
    
    # Test notifications endpoint  
    notifications_test_passed = test_notifications_endpoint()
    
    print("\n" + "=" * 70)
    print("📊 CRITICAL TEST RESULTS:")
    print(f"Order Status Updates: {'✅ WORKING' if status_test_passed else '❌ FAILED'}")
    print(f"Notifications Endpoint: {'✅ WORKING' if notifications_test_passed else '❌ FAILED'}")
    
    if status_test_passed and notifications_test_passed:
        print("\n🎉 CRITICAL BUG FIXES VERIFIED!")
        return 0
    else:
        print("\n❌ SOME CRITICAL ISSUES REMAIN")
        return 1

if __name__ == "__main__":
    exit(main())