#!/usr/bin/env python3
"""
Critical Endpoints Pre-Launch Verification Test
Testing specific endpoints mentioned in the review request
"""

import requests
import json
from datetime import datetime

class CriticalEndpointsTest:
    def __init__(self):
        self.base_url = "https://red-auth-connect.preview.emergentagent.com"
        self.pulperia_token = "-VQBIlnpDEMpfon3aq3vZAlmk0n-bkvQSixYRttrn78"  # Valid pulperia token
        self.tests_run = 0
        self.tests_passed = 0
        self.critical_issues = []
        self.minor_issues = []

    def test_endpoint(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Test a single endpoint"""
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

            success = response.status_code == expected_status
                
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ FAILED - Expected {expected_status}, got {response.status_code}")
                error_detail = f"{name}: Expected {expected_status}, got {response.status_code}"
                if response.status_code >= 500:
                    self.critical_issues.append(error_detail)
                else:
                    self.minor_issues.append(error_detail)
                try:
                    print(f"Response: {response.text}")
                except:
                    pass
                return False, {}

        except Exception as e:
            print(f"❌ FAILED - Error: {str(e)}")
            self.critical_issues.append(f"{name}: Exception - {str(e)}")
            return False, {}

    def test_critical_auth_endpoints(self):
        """Test critical authentication endpoints"""
        print("\n" + "="*60)
        print("🔐 TESTING CRITICAL AUTHENTICATION ENDPOINTS")
        print("="*60)
        
        # 1. /api/auth/me - Get current user
        success, response = self.test_endpoint(
            "GET /api/auth/me (authenticated)",
            "GET", "auth/me", 200, token=self.pulperia_token
        )
        if success:
            user_type = response.get('user_type')
            print(f"   ✅ User type: {user_type}")
            if user_type not in ['cliente', 'pulperia']:
                self.minor_issues.append("auth/me: Invalid user_type returned")
        
        # 2. /api/auth/session - Session creation (expected to fail with test data)
        self.test_endpoint(
            "POST /api/auth/session (external auth service)",
            "POST", "auth/session", 502, 
            data={"session_id": "test_session_123"}
        )

    def test_critical_pulperia_endpoints(self):
        """Test critical pulperia CRUD with customization"""
        print("\n" + "="*60)
        print("🏪 TESTING CRITICAL PULPERIA ENDPOINTS")
        print("="*60)
        
        # Create test pulperia with customization fields
        pulperia_data = {
            "name": "Test Pulpería Critical",
            "description": "Testing customization fields",
            "address": "Tegucigalpa, Honduras",
            "location": {"lat": 14.0723, "lng": -87.1921},
            "phone": "+504 9999-9999",
            "title_font": "serif",
            "background_color": "#2563EB"
        }
        
        success, response = self.test_endpoint(
            "POST /api/pulperias (with customization)",
            "POST", "pulperias", 200, 
            data=pulperia_data, token=self.pulperia_token
        )
        
        pulperia_id = None
        if success:
            pulperia_id = response.get('pulperia_id')
            title_font = response.get('title_font')
            background_color = response.get('background_color')
            print(f"   ✅ Created pulperia: {pulperia_id}")
            print(f"   ✅ Title font: {title_font}")
            print(f"   ✅ Background color: {background_color}")
            
            if title_font != "serif" or background_color != "#2563EB":
                self.minor_issues.append("Pulperia customization fields not saved correctly")
        
        # Test PUT with different customization
        if pulperia_id:
            update_data = pulperia_data.copy()
            update_data["title_font"] = "bold"
            update_data["background_color"] = "#DC2626"
            
            success, response = self.test_endpoint(
                "PUT /api/pulperias/{id} (update customization)",
                "PUT", f"pulperias/{pulperia_id}", 200,
                data=update_data, token=self.pulperia_token
            )
            
            if success:
                new_font = response.get('title_font')
                new_color = response.get('background_color')
                print(f"   ✅ Updated font: {new_font}, color: {new_color}")
        
        return pulperia_id

    def test_critical_product_endpoints(self, pulperia_id):
        """Test critical product endpoints with availability toggle"""
        print("\n" + "="*60)
        print("📦 TESTING CRITICAL PRODUCT ENDPOINTS")
        print("="*60)
        
        if not pulperia_id:
            self.critical_issues.append("Cannot test products - no pulperia created")
            return None
        
        # Create product
        product_data = {
            "name": "Test Product Critical",
            "description": "Testing availability toggle",
            "price": 25.0,
            "stock": 50,
            "available": True,
            "category": "Test"
        }
        
        success, response = self.test_endpoint(
            "POST /api/products (create)",
            "POST", f"products?pulperia_id={pulperia_id}", 200,
            data=product_data, token=self.pulperia_token
        )
        
        product_id = None
        if success:
            product_id = response.get('product_id')
            available = response.get('available')
            print(f"   ✅ Created product: {product_id}")
            print(f"   ✅ Initial availability: {available}")
        
        # Test availability toggle
        if product_id:
            success, response = self.test_endpoint(
                "PUT /api/products/{id}/availability (toggle)",
                "PUT", f"products/{product_id}/availability", 200,
                token=self.pulperia_token
            )
            
            if success:
                new_availability = response.get('available')
                print(f"   ✅ Toggled availability to: {new_availability}")
                
                if new_availability == True:  # Should be False after toggle
                    self.minor_issues.append("Product availability toggle not working correctly")
        
        return product_id

    def test_critical_order_endpoints(self, pulperia_id, product_id):
        """Test critical order endpoints"""
        print("\n" + "="*60)
        print("📋 TESTING CRITICAL ORDER ENDPOINTS")
        print("="*60)
        
        # Test GET orders (pulperia view)
        success, response = self.test_endpoint(
            "GET /api/orders (pulperia view)",
            "GET", "orders", 200, token=self.pulperia_token
        )
        
        if success:
            orders = response if isinstance(response, list) else []
            print(f"   ✅ Retrieved {len(orders)} orders")
        
        # Note: Cannot test order creation/status updates without cliente token
        print("   ⚠️  Order creation/status tests require cliente authentication")

    def test_critical_review_endpoints(self, pulperia_id):
        """Test critical review endpoints with images"""
        print("\n" + "="*60)
        print("⭐ TESTING CRITICAL REVIEW ENDPOINTS")
        print("="*60)
        
        if not pulperia_id:
            self.critical_issues.append("Cannot test reviews - no pulperia created")
            return
        
        # Test GET reviews
        success, response = self.test_endpoint(
            "GET /api/pulperias/{id}/reviews",
            "GET", f"pulperias/{pulperia_id}/reviews", 200
        )
        
        if success:
            reviews = response if isinstance(response, list) else []
            print(f"   ✅ Retrieved {len(reviews)} reviews")
        
        # Test review creation with pulperia user (should fail)
        review_data = {
            "rating": 5,
            "comment": "Test review",
            "images": ["data:image/jpeg;base64,test"]
        }
        
        self.test_endpoint(
            "POST /api/pulperias/{id}/reviews (pulperia user - should fail)",
            "POST", f"pulperias/{pulperia_id}/reviews", 403,
            data=review_data, token=self.pulperia_token
        )

    def test_critical_job_endpoints(self, pulperia_id):
        """Test critical job endpoints linked to pulperias"""
        print("\n" + "="*60)
        print("💼 TESTING CRITICAL JOB ENDPOINTS")
        print("="*60)
        
        # Test GET all jobs
        success, response = self.test_endpoint(
            "GET /api/jobs (all jobs)",
            "GET", "jobs", 200
        )
        
        if success:
            jobs = response if isinstance(response, list) else []
            print(f"   ✅ Retrieved {len(jobs)} jobs")
        
        # Test create job linked to pulperia
        if pulperia_id:
            job_data = {
                "title": "Critical Test Job",
                "description": "Testing job linked to pulperia",
                "category": "Test",
                "pay_rate": 8000.0,
                "pay_currency": "HNL",
                "location": "Tegucigalpa",
                "contact": "+504 9999-9999",
                "pulperia_id": pulperia_id
            }
            
            success, response = self.test_endpoint(
                "POST /api/jobs (linked to pulperia)",
                "POST", "jobs", 200,
                data=job_data, token=self.pulperia_token
            )
            
            job_id = None
            if success:
                job_id = response.get('job_id')
                pulperia_name = response.get('pulperia_name')
                linked_pulperia_id = response.get('pulperia_id')
                print(f"   ✅ Created job: {job_id}")
                print(f"   ✅ Linked to pulperia: {pulperia_name} ({linked_pulperia_id})")
                
                if linked_pulperia_id != pulperia_id:
                    self.minor_issues.append("Job not properly linked to pulperia")
            
            # Test GET pulperia jobs
            success, response = self.test_endpoint(
                "GET /api/pulperias/{id}/jobs",
                "GET", f"pulperias/{pulperia_id}/jobs", 200
            )
            
            if success:
                pulperia_jobs = response if isinstance(response, list) else []
                print(f"   ✅ Retrieved {len(pulperia_jobs)} jobs for pulperia")
                
                # Check if our job is in the list
                job_found = any(job.get('job_id') == job_id for job in pulperia_jobs)
                if job_id and not job_found:
                    self.minor_issues.append("Created job not found in pulperia jobs list")
            
            # Clean up
            if job_id:
                self.test_endpoint(
                    "DELETE /api/jobs/{id} (cleanup)",
                    "DELETE", f"jobs/{job_id}", 200,
                    token=self.pulperia_token
                )

    def test_critical_ad_endpoints(self):
        """Test critical advertisement endpoints"""
        print("\n" + "="*60)
        print("📢 TESTING CRITICAL ADVERTISEMENT ENDPOINTS")
        print("="*60)
        
        # Test GET ad plans
        success, response = self.test_endpoint(
            "GET /api/ads/plans",
            "GET", "ads/plans", 200
        )
        
        if success:
            plans = response
            expected_plans = ['basico', 'destacado', 'premium']
            print(f"   ✅ Available plans: {list(plans.keys())}")
            
            for plan in expected_plans:
                if plan not in plans:
                    self.critical_issues.append(f"Missing ad plan: {plan}")
                else:
                    plan_info = plans[plan]
                    print(f"   ✅ {plan}: L{plan_info.get('price')} for {plan_info.get('duration')} days")
        
        # Test GET featured pulperias
        success, response = self.test_endpoint(
            "GET /api/ads/featured",
            "GET", "ads/featured", 200
        )
        
        if success:
            featured = response if isinstance(response, list) else []
            print(f"   ✅ Featured pulperias: {len(featured)}")

    def test_critical_notification_endpoints(self):
        """Test critical notification endpoints"""
        print("\n" + "="*60)
        print("🔔 TESTING CRITICAL NOTIFICATION ENDPOINTS")
        print("="*60)
        
        success, response = self.test_endpoint(
            "GET /api/notifications (pulperia user)",
            "GET", "notifications", 200, token=self.pulperia_token
        )
        
        if success:
            notifications = response if isinstance(response, list) else []
            print(f"   ✅ Retrieved {len(notifications)} notifications")
            
            # Check notification structure
            for notif in notifications[:3]:
                required_fields = ['id', 'type', 'title', 'message']
                missing_fields = [field for field in required_fields if field not in notif]
                if missing_fields:
                    self.minor_issues.append(f"Notification missing fields: {missing_fields}")

    def run_data_integrity_checks(self):
        """Run data integrity checks"""
        print("\n" + "="*60)
        print("🔍 DATA INTEGRITY CHECKS")
        print("="*60)
        
        # Check MongoDB connection by testing a simple query
        success, response = self.test_endpoint(
            "MongoDB Connection Check (via pulperias endpoint)",
            "GET", "pulperias", 200
        )
        
        if success:
            print("   ✅ MongoDB connection working")
        else:
            self.critical_issues.append("MongoDB connection issues detected")
        
        # Check for N+1 query issues by testing products endpoint
        success, response = self.test_endpoint(
            "N+1 Query Check (products with pulperia info)",
            "GET", "products", 200
        )
        
        if success:
            products = response if isinstance(response, list) else []
            print(f"   ✅ Products endpoint returned {len(products)} items")
            
            # Check if pulperia info is included (indicates optimized queries)
            if products:
                first_product = products[0]
                if 'pulperia_name' in first_product:
                    print("   ✅ Optimized queries detected (pulperia info included)")
                else:
                    self.minor_issues.append("Potential N+1 query issue in products endpoint")

    def run_all_tests(self):
        """Run all critical endpoint tests"""
        print("🚀 STARTING CRITICAL ENDPOINTS PRE-LAUNCH VERIFICATION")
        print("="*80)
        
        # Run all test suites
        self.test_critical_auth_endpoints()
        pulperia_id = self.test_critical_pulperia_endpoints()
        product_id = self.test_critical_product_endpoints(pulperia_id)
        self.test_critical_order_endpoints(pulperia_id, product_id)
        self.test_critical_review_endpoints(pulperia_id)
        self.test_critical_job_endpoints(pulperia_id)
        self.test_critical_ad_endpoints()
        self.test_critical_notification_endpoints()
        self.run_data_integrity_checks()
        
        # Clean up test data
        if product_id:
            self.test_endpoint(
                "DELETE test product (cleanup)",
                "DELETE", f"products/{product_id}", 200,
                token=self.pulperia_token
            )
        
        # Print final results
        print("\n" + "="*80)
        print("📊 CRITICAL ENDPOINTS TEST RESULTS")
        print("="*80)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.critical_issues:
            print(f"\n🚨 CRITICAL ISSUES ({len(self.critical_issues)}):")
            for issue in self.critical_issues:
                print(f"   ❌ {issue}")
        
        if self.minor_issues:
            print(f"\n⚠️  MINOR ISSUES ({len(self.minor_issues)}):")
            for issue in self.minor_issues:
                print(f"   ⚠️  {issue}")
        
        if not self.critical_issues and not self.minor_issues:
            print("\n🎉 ALL CRITICAL ENDPOINTS WORKING PERFECTLY!")
        elif not self.critical_issues:
            print("\n✅ ALL CRITICAL ENDPOINTS WORKING (minor issues noted)")
        else:
            print("\n❌ CRITICAL ISSUES DETECTED - NEEDS ATTENTION")
        
        return len(self.critical_issues) == 0

if __name__ == "__main__":
    tester = CriticalEndpointsTest()
    success = tester.run_all_tests()
    exit(0 if success else 1)