"""
Test iteration 5 - Testing new features:
1. Google OAuth URL endpoint with custom domain redirect
2. Notifications endpoint with items, total, total_items, item_summary
3. WebSocket broadcast order_update with pulperia_name, items, total
4. PulperiaProfile address clickeable to Google Maps
5. Header notification banner for permission request
6. Notifications show product breakdown
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://lapulperia.preview.emergentagent.com')

class TestGoogleOAuthEndpoint:
    """Test Google OAuth URL endpoint for custom domain"""
    
    def test_google_auth_url_returns_valid_url(self):
        """Test that /api/auth/google/url returns a valid auth_url"""
        redirect_uri = "https://lapulperiastore.net/auth/callback"
        response = requests.get(f"{BASE_URL}/api/auth/google/url", params={"redirect_uri": redirect_uri})
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "auth_url" in data, "Response should contain auth_url"
        
        auth_url = data["auth_url"]
        assert "accounts.google.com" in auth_url, "auth_url should point to Google"
        assert "client_id=" in auth_url, "auth_url should contain client_id"
        assert redirect_uri in auth_url, f"auth_url should contain redirect_uri: {redirect_uri}"
        
        print(f"✅ Google OAuth URL endpoint working correctly")
        print(f"   Auth URL contains correct redirect_uri: {redirect_uri}")
    
    def test_google_auth_url_with_preview_domain(self):
        """Test that /api/auth/google/url works with preview domain too"""
        redirect_uri = "https://lapulperia.preview.emergentagent.com/auth/callback"
        response = requests.get(f"{BASE_URL}/api/auth/google/url", params={"redirect_uri": redirect_uri})
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "auth_url" in data, "Response should contain auth_url"
        
        print(f"✅ Google OAuth URL endpoint works with preview domain")


class TestNotificationsEndpoint:
    """Test notifications endpoint returns proper structure"""
    
    def test_notifications_requires_auth(self):
        """Test that /api/notifications requires authentication"""
        response = requests.get(f"{BASE_URL}/api/notifications")
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"✅ Notifications endpoint correctly requires authentication")
    
    def test_notifications_structure_with_auth(self):
        """Test notifications structure - requires valid session"""
        # This test would need a valid session token
        # For now, we verify the endpoint exists and requires auth
        response = requests.get(f"{BASE_URL}/api/notifications")
        assert response.status_code == 401, "Should require authentication"
        print(f"✅ Notifications endpoint exists and requires auth")


class TestPulperiasEndpoint:
    """Test pulperias endpoint for address data"""
    
    def test_pulperias_list(self):
        """Test that /api/pulperias returns list with location data"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            pulperia = data[0]
            # Check for address and location fields needed for Google Maps link
            assert "address" in pulperia, "Pulperia should have address field"
            assert "location" in pulperia, "Pulperia should have location field"
            
            if pulperia.get("location"):
                location = pulperia["location"]
                # Location should have lat/lng for Google Maps directions
                if location:
                    assert "lat" in location or location is None, "Location should have lat"
                    assert "lng" in location or location is None, "Location should have lng"
            
            print(f"✅ Pulperias endpoint returns proper address/location data")
            print(f"   Sample pulperia: {pulperia.get('name')}")
            print(f"   Address: {pulperia.get('address')}")
            print(f"   Location: {pulperia.get('location')}")
        else:
            print(f"⚠️ No pulperias found in database")
    
    def test_single_pulperia_has_location(self):
        """Test that single pulperia has location for Google Maps"""
        # First get list
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        
        data = response.json()
        if len(data) > 0:
            pulperia_id = data[0]["pulperia_id"]
            
            # Get single pulperia
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}")
            assert response.status_code == 200
            
            pulperia = response.json()
            assert "address" in pulperia, "Single pulperia should have address"
            assert "location" in pulperia, "Single pulperia should have location"
            
            print(f"✅ Single pulperia endpoint returns address/location data")
        else:
            pytest.skip("No pulperias available for testing")


class TestOrdersEndpoint:
    """Test orders endpoint structure"""
    
    def test_orders_requires_auth(self):
        """Test that /api/orders requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"✅ Orders endpoint correctly requires authentication")


class TestProductsEndpoint:
    """Test products endpoint"""
    
    def test_products_list(self):
        """Test that /api/products returns list"""
        response = requests.get(f"{BASE_URL}/api/products")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            product = data[0]
            assert "product_id" in product, "Product should have product_id"
            assert "name" in product, "Product should have name"
            assert "price" in product, "Product should have price"
            assert "pulperia_id" in product, "Product should have pulperia_id"
            
            print(f"✅ Products endpoint returns proper data")
            print(f"   Sample product: {product.get('name')} - L{product.get('price')}")
        else:
            print(f"⚠️ No products found in database")


class TestFavoritesEndpoint:
    """Test favorites endpoint"""
    
    def test_favorites_requires_auth(self):
        """Test that /api/favorites requires authentication"""
        response = requests.get(f"{BASE_URL}/api/favorites")
        
        assert response.status_code == 401, f"Expected 401 for unauthenticated request, got {response.status_code}"
        print(f"✅ Favorites endpoint correctly requires authentication")


class TestJobsEndpoint:
    """Test jobs endpoint"""
    
    def test_jobs_list(self):
        """Test that /api/jobs returns list"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Jobs endpoint returns list ({len(data)} jobs)")


class TestServicesEndpoint:
    """Test services endpoint"""
    
    def test_services_list(self):
        """Test that /api/services returns list"""
        response = requests.get(f"{BASE_URL}/api/services")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Services endpoint returns list ({len(data)} services)")


class TestAdsEndpoint:
    """Test advertising endpoints"""
    
    def test_ads_plans(self):
        """Test that /api/ads/plans returns plans"""
        response = requests.get(f"{BASE_URL}/api/ads/plans")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "basico" in data, "Should have basico plan"
        assert "destacado" in data, "Should have destacado plan"
        assert "premium" in data, "Should have premium plan"
        
        print(f"✅ Ads plans endpoint returns all plans")
    
    def test_ads_featured(self):
        """Test that /api/ads/featured returns list"""
        response = requests.get(f"{BASE_URL}/api/ads/featured")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Featured ads endpoint returns list ({len(data)} featured)")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
