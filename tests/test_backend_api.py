"""
Backend API Tests for La Pulpería App
Tests: ads/plans, jobs, services, pulperias endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://pulpito-delivery.preview.emergentagent.com')

class TestPublicEndpoints:
    """Test public API endpoints that don't require authentication"""
    
    def test_get_ad_plans(self):
        """Test GET /api/ads/plans returns ad plans"""
        response = requests.get(f"{BASE_URL}/api/ads/plans")
        assert response.status_code == 200
        
        data = response.json()
        # Verify structure - should have basico, destacado, premium plans
        assert "basico" in data
        assert "destacado" in data
        assert "premium" in data
        
        # Verify each plan has required fields
        for plan_name, plan_data in data.items():
            assert "price" in plan_data
            assert "duration" in plan_data
            assert "name" in plan_data
            assert "features" in plan_data
            assert isinstance(plan_data["features"], list)
    
    def test_get_jobs(self):
        """Test GET /api/jobs returns jobs list"""
        response = requests.get(f"{BASE_URL}/api/jobs")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are jobs, verify structure
        if len(data) > 0:
            job = data[0]
            assert "job_id" in job
            assert "title" in job
            assert "description" in job
            assert "category" in job
            assert "pay_rate" in job
            assert "pay_currency" in job
            assert "location" in job
            assert "contact" in job
            assert "employer_name" in job
    
    def test_get_services(self):
        """Test GET /api/services returns services list"""
        response = requests.get(f"{BASE_URL}/api/services")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are services, verify structure
        if len(data) > 0:
            service = data[0]
            assert "service_id" in service
            assert "title" in service
            assert "description" in service
            assert "category" in service
            assert "hourly_rate" in service
            assert "rate_currency" in service
            assert "location" in service
            assert "contact" in service
            assert "provider_name" in service
    
    def test_get_pulperias(self):
        """Test GET /api/pulperias returns pulperias list"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are pulperias, verify structure
        if len(data) > 0:
            pulperia = data[0]
            assert "pulperia_id" in pulperia
            assert "name" in pulperia
            assert "address" in pulperia
            assert "location" in pulperia
            assert "rating" in pulperia
    
    def test_get_featured_pulperias(self):
        """Test GET /api/ads/featured returns featured pulperias"""
        response = requests.get(f"{BASE_URL}/api/ads/featured")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_ad_assignment_log(self):
        """Test GET /api/ads/assignment-log returns logs"""
        response = requests.get(f"{BASE_URL}/api/ads/assignment-log")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_products(self):
        """Test GET /api/products returns products list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_jobs_search(self):
        """Test GET /api/jobs with search parameter"""
        response = requests.get(f"{BASE_URL}/api/jobs", params={"search": "ventas"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_services_search(self):
        """Test GET /api/services with search parameter"""
        response = requests.get(f"{BASE_URL}/api/services", params={"search": "limpieza"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
    
    def test_pulperias_search(self):
        """Test GET /api/pulperias with search parameter"""
        response = requests.get(f"{BASE_URL}/api/pulperias", params={"search": "bodega"})
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


class TestAuthenticatedEndpoints:
    """Test endpoints that require authentication - expect 401 without auth"""
    
    def test_get_me_requires_auth(self):
        """Test GET /api/auth/me requires authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
    
    def test_get_orders_requires_auth(self):
        """Test GET /api/orders requires authentication"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 401
    
    def test_create_job_requires_auth(self):
        """Test POST /api/jobs requires authentication"""
        response = requests.post(f"{BASE_URL}/api/jobs", json={
            "title": "Test Job",
            "description": "Test",
            "category": "Ventas",
            "pay_rate": 100,
            "pay_currency": "HNL",
            "location": "Test",
            "contact": "test@test.com"
        })
        assert response.status_code == 401
    
    def test_create_service_requires_auth(self):
        """Test POST /api/services requires authentication"""
        response = requests.post(f"{BASE_URL}/api/services", json={
            "title": "Test Service",
            "description": "Test",
            "category": "Limpieza",
            "hourly_rate": 100,
            "rate_currency": "HNL",
            "location": "Test",
            "contact": "test@test.com"
        })
        assert response.status_code == 401


class TestPulperiaEndpoints:
    """Test pulperia-specific endpoints"""
    
    def test_get_pulperia_by_id(self):
        """Test GET /api/pulperias/{id} returns pulperia or 404"""
        # First get list to find a valid ID
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}")
            assert response.status_code == 200
            
            data = response.json()
            assert data["pulperia_id"] == pulperia_id
        else:
            # Test with invalid ID
            response = requests.get(f"{BASE_URL}/api/pulperias/invalid_id")
            assert response.status_code == 404
    
    def test_get_pulperia_products(self):
        """Test GET /api/pulperias/{id}/products"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/products")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
    
    def test_get_pulperia_reviews(self):
        """Test GET /api/pulperias/{id}/reviews"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/reviews")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
    
    def test_get_pulperia_announcements(self):
        """Test GET /api/pulperias/{id}/announcements"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/announcements")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
    
    def test_get_pulperia_jobs(self):
        """Test GET /api/pulperias/{id}/jobs"""
        response = requests.get(f"{BASE_URL}/api/pulperias")
        pulperias = response.json()
        
        if len(pulperias) > 0:
            pulperia_id = pulperias[0]["pulperia_id"]
            response = requests.get(f"{BASE_URL}/api/pulperias/{pulperia_id}/jobs")
            assert response.status_code == 200
            assert isinstance(response.json(), list)


class TestAdminEndpoints:
    """Test admin endpoints - should require admin authentication"""
    
    def test_admin_pulperias_requires_auth(self):
        """Test GET /api/admin/pulperias requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/pulperias")
        assert response.status_code == 401
    
    def test_admin_ads_requires_auth(self):
        """Test GET /api/admin/ads requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/ads")
        assert response.status_code == 401
    
    def test_admin_messages_requires_auth(self):
        """Test GET /api/admin/messages requires admin auth"""
        response = requests.get(f"{BASE_URL}/api/admin/messages")
        assert response.status_code == 401


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
