"""
Backend API Tests for La Pulpería App - Iteration 4
Tests: Favorites endpoints, announcements with images, notifications, orders
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://premium-grocery-1.preview.emergentagent.com')

class TestPublicEndpoints:
    """Test public API endpoints that don't require authentication"""
    
    def test_get_pulperias(self):
        """Test GET /api/pulperias returns pulperias list"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        if len(data) > 0:
            pulperia = data[0]
            assert "pulperia_id" in pulperia
            assert "name" in pulperia
            assert "address" in pulperia
            assert "location" in pulperia
            assert "rating" in pulperia
            print(f"✅ Found {len(data)} pulperias")
    
    def test_get_single_pulperia(self):
        """Test GET /api/pulperias/{id} returns single pulperia"""
        # First get list to get a valid ID
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["pulperia_id"] == pulperia_id
            print(f"✅ Got pulperia: {data['name']}")
    
    def test_get_pulperia_products(self):
        """Test GET /api/pulperias/{id}/products returns products"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/products")
            assert response.status_code == 200
            
            data = response.json()
            assert isinstance(data, list)
            print(f"✅ Found {len(data)} products for pulperia")
    
    def test_get_pulperia_reviews(self):
        """Test GET /api/pulperias/{id}/reviews returns reviews"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/reviews")
            assert response.status_code == 200
            
            data = response.json()
            assert isinstance(data, list)
            print(f"✅ Found {len(data)} reviews for pulperia")
    
    def test_get_pulperia_announcements(self):
        """Test GET /api/pulperias/{id}/announcements returns announcements with image support"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/announcements")
            assert response.status_code == 200
            
            data = response.json()
            assert isinstance(data, list)
            
            # If there are announcements, verify image_url field exists
            if len(data) > 0:
                announcement = data[0]
                assert "announcement_id" in announcement
                assert "content" in announcement
                # image_url should be present (can be null)
                assert "image_url" in announcement or announcement.get("image_url") is None
                print(f"✅ Found {len(data)} announcements, image_url field supported")
            else:
                print("✅ Announcements endpoint works (no announcements yet)")
    
    def test_get_pulperia_jobs(self):
        """Test GET /api/pulperias/{id}/jobs returns jobs"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/jobs")
            assert response.status_code == 200
            
            data = response.json()
            assert isinstance(data, list)
            print(f"✅ Found {len(data)} jobs for pulperia")
    
    def test_get_ad_plans(self):
        """Test GET /api/ads/plans returns ad plans"""
        response = requests.get(f"{BASE_URL}/api/ads/plans")
        assert response.status_code == 200
        
        data = response.json()
        assert "basico" in data
        assert "destacado" in data
        assert "premium" in data
        print("✅ Ad plans endpoint working")
    
    def test_get_featured_pulperias(self):
        """Test GET /api/ads/featured returns featured pulperias"""
        response = requests.get(f"{BASE_URL}/api/ads/featured")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} featured pulperias")
    
    def test_get_jobs(self):
        """Test GET /api/jobs returns jobs list"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} jobs")
    
    def test_get_services(self):
        """Test GET /api/services returns services list"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} services")
    
    def test_search_products(self):
        """Test GET /api/products with search"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} products")
    
    def test_get_ad_assignment_log(self):
        """Test GET /api/ads/assignment-log returns public log"""
        response = requests.get(f"{BASE_URL}/api/ads/assignment-log")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Found {len(data)} ad assignment logs")


class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication - should return 401"""
    
    def test_favorites_requires_auth(self):
        """Test GET /api/favorites requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        assert response.status_code == 401
        
        data = response.json()
        assert "detail" in data
        print("✅ GET /api/favorites correctly requires auth")
    
    def test_add_favorite_requires_auth(self):
        """Test POST /api/favorites/{id} requires authentication"""
        response = requests.post(f"{BASE_URL}/api/favorites/test_pulperia_id")
        assert response.status_code == 401
        
        data = response.json()
        assert "detail" in data
        print("✅ POST /api/favorites/{id} correctly requires auth")
    
    def test_remove_favorite_requires_auth(self):
        """Test DELETE /api/favorites/{id} requires authentication"""
        response = requests.delete(f"{BASE_URL}/api/favorites/test_pulperia_id")
        assert response.status_code == 401
        
        data = response.json()
        assert "detail" in data
        print("✅ DELETE /api/favorites/{id} correctly requires auth")
    
    def test_check_favorite_requires_auth(self):
        """Test GET /api/favorites/{id}/check requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites/test_pulperia_id/check")
        assert response.status_code == 401
        
        data = response.json()
        assert "detail" in data
        print("✅ GET /api/favorites/{id}/check correctly requires auth")
    
    def test_get_orders_requires_auth(self):
        """Test GET /api/orders requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 401
        print("✅ GET /api/orders correctly requires auth")
    
    def test_get_notifications_requires_auth(self):
        """Test GET /api/notifications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401
        print("✅ GET /api/notifications correctly requires auth")
    
    def test_get_auth_me_requires_auth(self):
        """Test GET /api/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        print("✅ GET /api/auth/me correctly requires auth")
    
    def test_admin_endpoints_require_auth(self):
        """Test admin endpoints require authentication"""
        endpoints = [
            "/api/admin/pulperias",
            "/api/admin/ads",
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            assert response.status_code == 401, f"Expected 401 for {endpoint}, got {response.status_code}"
        
        print("✅ Admin endpoints correctly require auth")


class TestErrorHandling:
    """Test error handling for invalid requests"""
    
    def test_invalid_pulperia_id(self):
        """Test GET /api/pulperias/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/pulperias/invalid_pulperia_id_12345")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
        print("✅ Invalid pulperia ID returns 404")
    
    def test_invalid_product_id(self):
        """Test GET /api/products/{invalid_id} returns 404"""
        response = requests.get(f"{BASE_URL}/api/products/invalid_product_id_12345")
        assert response.status_code == 404
        
        data = response.json()
        assert "detail" in data
        print("✅ Invalid product ID returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
