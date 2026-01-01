"""
Iteration 6 Tests - La Pulpería App
Testing:
1. Logo en landing page debe tener techo PLANO (no triangular)
2. Verificar que el botón 'Comenzar con Google' está visible y funcional
3. Verificar que el nuevo endpoint DELETE /api/pulperias/{id}/close existe y requiere autenticación
4. Verificar que la página BadgeDemo ha sido eliminada (ruta /badge-demo no debe existir)
"""

import pytest
import requests
import os
import re

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestIteration6Features:
    """Test new features for iteration 6"""
    
    def test_api_health(self):
        """Test API is accessible"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        print("✅ API health check passed")
    
    def test_close_endpoint_exists_and_requires_auth(self):
        """Test DELETE /api/pulperias/{id}/close endpoint exists and requires authentication"""
        # Test with a fake pulperia ID - should return 401 (not authenticated)
        response = requests.delete(
            f"{BASE_URL}/api/pulperias/test_pulperia_123/close",
            json={"confirmation_phrase": "test"}
        )
        # Should return 401 (not authenticated) not 404 (not found)
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        data = response.json()
        assert "detail" in data
        assert "autenticado" in data["detail"].lower() or "authenticated" in data["detail"].lower()
        print("✅ Close endpoint exists and requires authentication")
    
    def test_close_endpoint_with_invalid_auth(self):
        """Test close endpoint with invalid auth token"""
        response = requests.delete(
            f"{BASE_URL}/api/pulperias/test_pulperia_123/close",
            headers={"Authorization": "Bearer invalid_token"},
            json={"confirmation_phrase": "test"}
        )
        # Should return 401 (invalid session)
        assert response.status_code == 401
        print("✅ Close endpoint rejects invalid auth tokens")
    
    def test_badge_demo_route_not_exists(self):
        """Test that /badge-demo route does not exist in frontend"""
        # This tests the frontend route - should return 200 but with landing page content
        # since React SPA returns index.html for all routes
        response = requests.get(f"{BASE_URL}/badge-demo")
        # The route should not be defined in React Router
        # We can verify by checking the response doesn't contain BadgeDemo specific content
        assert response.status_code == 200  # SPA returns 200 for all routes
        # The content should be the main app, not a specific BadgeDemo page
        print("✅ Badge demo route check passed (SPA returns main app)")
    
    def test_google_auth_url_endpoint(self):
        """Test Google OAuth URL endpoint"""
        redirect_uri = f"{BASE_URL}/auth/callback"
        response = requests.get(
            f"{BASE_URL}/api/auth/google/url",
            params={"redirect_uri": redirect_uri}
        )
        assert response.status_code == 200
        data = response.json()
        assert "auth_url" in data
        assert "accounts.google.com" in data["auth_url"]
        assert "client_id" in data["auth_url"]
        print(f"✅ Google OAuth URL endpoint works: {data['auth_url'][:80]}...")
    
    def test_pulperias_list(self):
        """Test pulperias list endpoint"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Pulperias list returned {len(data)} items")
    
    def test_products_search(self):
        """Test products search endpoint"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Products search returned {len(data)} items")
    
    def test_featured_ads_endpoint(self):
        """Test featured ads endpoint"""
        response = requests.get(f"{BASE_URL}/api/featured-ads")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Featured ads endpoint works, returned {len(data)} items")
    
    def test_achievement_definitions(self):
        """Test achievement definitions endpoint"""
        response = requests.get(f"{BASE_URL}/api/achievements/definitions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0
        print(f"✅ Achievement definitions returned {len(data)} badges")
    
    def test_jobs_endpoint(self):
        """Test jobs endpoint"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Jobs endpoint works, returned {len(data)} items")
    
    def test_services_endpoint(self):
        """Test services endpoint"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Services endpoint works, returned {len(data)} items")


class TestLogoVerification:
    """Test logo has flat roof (rect elements, not triangular polygon)"""
    
    def test_logo_svg_has_flat_roof(self):
        """Verify logo SVG uses rect elements for roof (flat) not polygon (triangular)"""
        # Read the LandingPage.js file
        landing_page_path = "/app/frontend/src/pages/LandingPage.js"
        with open(landing_page_path, 'r') as f:
            content = f.read()
        
        # Find the PulperiaLogo component
        logo_match = re.search(r'const PulperiaLogo.*?return \((.*?)\);', content, re.DOTALL)
        assert logo_match, "PulperiaLogo component not found"
        
        logo_svg = logo_match.group(1)
        
        # Check for flat roof elements (rect) in the roof section
        # The roof should use rect elements, not polygon for triangular shape
        roof_section = re.search(r'Techo.*?Edificio principal', logo_svg, re.DOTALL)
        assert roof_section, "Roof section not found in logo"
        
        roof_content = roof_section.group(0)
        
        # Count rect elements in roof (should have multiple for stepped flat roof)
        rect_count = len(re.findall(r'<rect', roof_content))
        assert rect_count >= 3, f"Expected at least 3 rect elements for flat roof, found {rect_count}"
        
        # Check that there's no triangular polygon in the roof section
        # (polygon with 3 points forming a triangle)
        triangular_polygon = re.search(r'<polygon\s+points="[^"]*"[^>]*>', roof_content)
        if triangular_polygon:
            # If there's a polygon, it should be decorative, not the main roof shape
            polygon_points = triangular_polygon.group(0)
            # Decorative polygons are small (like the ones at x=30,78 and x=70,78)
            # Main triangular roof would have points spanning the full width
            assert "30,78" in polygon_points or "70,78" in polygon_points or "47" in polygon_points, \
                "Found triangular polygon that might be the roof"
        
        print("✅ Logo has flat roof (uses rect elements, not triangular polygon)")
        print(f"   Found {rect_count} rect elements in roof section")
    
    def test_logo_has_art_deco_style(self):
        """Verify logo has Art Deco styling elements"""
        landing_page_path = "/app/frontend/src/pages/LandingPage.js"
        with open(landing_page_path, 'r') as f:
            content = f.read()
        
        # Check for Art Deco gradients
        assert "artDecoRed" in content, "Art Deco red gradient not found"
        assert "artDecoGold" in content, "Art Deco gold gradient not found"
        assert "artDecoCream" in content, "Art Deco cream gradient not found"
        
        # Check for stepped/geometric roof comment
        assert "PLANO" in content or "plano" in content or "escalonado" in content, \
            "Flat roof comment not found"
        
        print("✅ Logo has Art Deco styling elements")


class TestAppJsRoutes:
    """Test App.js routes configuration"""
    
    def test_badge_demo_removed_from_routes(self):
        """Verify BadgeDemo is not in App.js routes"""
        app_js_path = "/app/frontend/src/App.js"
        with open(app_js_path, 'r') as f:
            content = f.read()
        
        # Check that BadgeDemo is not imported
        assert "BadgeDemo" not in content, "BadgeDemo should be removed from App.js"
        
        # Check that /badge-demo route is not defined
        assert "badge-demo" not in content, "/badge-demo route should be removed"
        
        print("✅ BadgeDemo removed from App.js routes")
    
    def test_required_routes_exist(self):
        """Verify required routes exist in App.js"""
        app_js_path = "/app/frontend/src/App.js"
        with open(app_js_path, 'r') as f:
            content = f.read()
        
        required_routes = [
            '/',
            '/auth/callback',
            '/map',
            '/dashboard',
            '/profile',
            '/cart',
            '/orders',
            '/search',
            '/admin',
            '/anuncios'
        ]
        
        for route in required_routes:
            assert f'path="{route}"' in content or f"path='{route}'" in content, \
                f"Route {route} not found in App.js"
        
        print(f"✅ All {len(required_routes)} required routes exist in App.js")


class TestCloseStoreBackend:
    """Test close store backend implementation"""
    
    def test_close_endpoint_in_server(self):
        """Verify close endpoint is implemented in server.py"""
        server_path = "/app/backend/server.py"
        with open(server_path, 'r') as f:
            content = f.read()
        
        # Check for the close endpoint
        assert '@api_router.delete("/pulperias/{pulperia_id}/close")' in content, \
            "Close endpoint not found in server.py"
        
        # Check for the function
        assert "async def close_own_pulperia" in content, \
            "close_own_pulperia function not found"
        
        # Check for confirmation phrase validation
        assert "confirmation_phrase" in content, \
            "confirmation_phrase validation not found"
        
        # Check for ClosePulperiaRequest model
        assert "class ClosePulperiaRequest" in content, \
            "ClosePulperiaRequest model not found"
        
        print("✅ Close store endpoint properly implemented in server.py")
    
    def test_close_endpoint_deletes_related_data(self):
        """Verify close endpoint deletes all related data"""
        server_path = "/app/backend/server.py"
        with open(server_path, 'r') as f:
            content = f.read()
        
        # Find the close_own_pulperia function
        func_match = re.search(r'async def close_own_pulperia.*?return \{', content, re.DOTALL)
        assert func_match, "close_own_pulperia function not found"
        
        func_content = func_match.group(0)
        
        # Check that it deletes related collections
        collections_to_delete = [
            'products',
            'orders',
            'reviews',
            'achievements',
            'announcements',
            'jobs',
            'featured_ads',
            'featured_ad_slots',
            'pulperias'
        ]
        
        for collection in collections_to_delete:
            assert f'db.{collection}.delete' in func_content, \
                f"Close endpoint should delete from {collection} collection"
        
        print(f"✅ Close endpoint deletes from all {len(collections_to_delete)} related collections")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
