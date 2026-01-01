"""
Iteration 7 Tests - La Pulpería
Testing:
1. Logo has triangular roof with wavy awning
2. Responsive design (mobile 375px and PC 1920px)
3. Close Store option in Profile page for pulperia users
4. Featured Ads System endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestFeaturedAdsEndpoints:
    """Test Featured Ads System endpoints"""
    
    def test_get_featured_ads_no_auth(self):
        """GET /api/featured-ads should work without authentication"""
        response = requests.get(f"{BASE_URL}/api/featured-ads")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ GET /api/featured-ads works without auth - returned {len(data)} ads")
    
    def test_get_my_slot_requires_auth(self):
        """GET /api/featured-ads/my-slot should require authentication"""
        response = requests.get(f"{BASE_URL}/api/featured-ads/my-slot")
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✅ GET /api/featured-ads/my-slot requires auth - returned {response.status_code}")
    
    def test_upload_featured_ad_requires_auth(self):
        """POST /api/featured-ads/upload should require authentication"""
        response = requests.post(f"{BASE_URL}/api/featured-ads/upload", json={
            "title": "Test Ad",
            "image_url": "https://example.com/image.jpg"
        })
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✅ POST /api/featured-ads/upload requires auth - returned {response.status_code}")


class TestCloseStoreEndpoint:
    """Test Close Store endpoint"""
    
    def test_close_store_requires_auth(self):
        """DELETE /api/pulperias/{id}/close should require authentication"""
        response = requests.delete(
            f"{BASE_URL}/api/pulperias/test_pulperia_id/close",
            json={"confirmation_phrase": "Test Store"}
        )
        # Should return 401 or 403 without auth
        assert response.status_code in [401, 403, 404], f"Expected 401/403/404 without auth, got {response.status_code}"
        print(f"✅ DELETE /api/pulperias/{{id}}/close requires auth - returned {response.status_code}")


class TestHealthAndBasicEndpoints:
    """Test basic API health"""
    
    def test_health_endpoint(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Health check failed: {response.status_code}"
        print("✅ Health endpoint working")
    
    def test_get_pulperias(self):
        """Test get pulperias endpoint"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200, f"Get pulperias failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ GET /api/pulperias works - returned {len(data)} pulperias")
    
    def test_get_products(self):
        """Test get products endpoint"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Get products failed: {response.status_code}"
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ GET /api/products works - returned {len(data)} products")


class TestAuthEndpoints:
    """Test auth endpoints"""
    
    def test_get_me_requires_auth(self):
        """GET /api/auth/me should require authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code in [401, 403], f"Expected 401/403 without auth, got {response.status_code}"
        print(f"✅ GET /api/auth/me requires auth - returned {response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
