from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Header, WebSocket, WebSocketDisconnect, File, UploadFile, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import re
import base64
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Literal, Dict, Set
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import asyncio
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'la_pulperia_db')]

app = FastAPI(title="La Pulpería API", version="2.0.0")
api_router = APIRouter(prefix="/api")

# Admin email for special access
ADMIN_EMAIL = "onol4sco05@gmail.com"

# Emergent Auth URL for Google OAuth
EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# PYDANTIC MODELS
# ============================================

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    user_type: Optional[Literal["cliente", "pulperia"]] = None
    location: Optional[dict] = None
    is_admin: Optional[bool] = False
    created_at: datetime

class Pulperia(BaseModel):
    pulperia_id: str
    owner_user_id: str
    name: str
    description: Optional[str] = None
    address: str
    location: dict
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    image_url: Optional[str] = None
    logo_url: Optional[str] = None
    rating: Optional[float] = 0.0
    review_count: Optional[int] = 0
    title_font: Optional[str] = "default"
    background_color: Optional[str] = "#DC2626"
    created_at: datetime

class Product(BaseModel):
    product_id: str
    pulperia_id: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    available: bool = True
    category: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    pulperia_id: Optional[str] = None
    pulperia_name: Optional[str] = None
    image_url: Optional[str] = None

class Order(BaseModel):
    order_id: str
    customer_user_id: str
    customer_name: str  # Name the customer wants for the order
    pulperia_id: str
    items: List[OrderItem]
    total: float
    status: Literal["pending", "accepted", "ready", "completed", "cancelled"] = "pending"
    order_type: Literal["online", "pickup"] = "pickup"
    created_at: datetime

class Review(BaseModel):
    review_id: str
    pulperia_id: str
    user_id: str
    user_name: str
    rating: int
    comment: Optional[str] = None
    images: List[str] = []
    created_at: datetime

class Job(BaseModel):
    job_id: str
    employer_user_id: str
    employer_name: str
    pulperia_id: Optional[str] = None
    pulperia_name: Optional[str] = None
    pulperia_logo: Optional[str] = None
    title: str
    description: str
    category: str
    pay_rate: float
    pay_currency: Literal["HNL", "USD"]
    location: str
    contact: str
    created_at: datetime

class Service(BaseModel):
    service_id: str
    provider_user_id: str
    provider_name: str
    title: str
    description: str
    category: str
    hourly_rate: float
    rate_currency: Literal["HNL", "USD"]
    location: str
    contact: str
    images: List[str] = []
    created_at: datetime

class Advertisement(BaseModel):
    ad_id: str
    pulperia_id: str
    pulperia_name: str
    plan: Literal["basico", "destacado", "premium", "recomendado"]
    status: Literal["pending", "active", "expired"] = "pending"
    payment_method: str
    payment_reference: Optional[str] = None
    amount: float
    duration_days: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    assigned_by: Optional[str] = None
    assigned_at: Optional[datetime] = None
    created_at: datetime

class AdAssignmentLog(BaseModel):
    log_id: str
    ad_id: str
    pulperia_id: str
    pulperia_name: str
    plan: str
    action: str  # "activated", "expired", "cancelled"
    assigned_by: str
    created_at: datetime

# Sistema de Logros - Definición de medallas y criterios
ACHIEVEMENT_DEFINITIONS = {
    "primera_venta": {
        "name": "Primera Venta",
        "description": "¡Completaste tu primera venta!",
        "icon": "ShoppingBag",
        "criteria": {"sales_count": 1}
    },
    "cliente_feliz": {
        "name": "10 Clientes Felices",
        "description": "10 clientes satisfechos",
        "icon": "Heart",
        "criteria": {"happy_customers": 10}
    },
    "catalogo_completo": {
        "name": "Catálogo Completo",
        "description": "10+ productos registrados",
        "icon": "Package",
        "criteria": {"products_count": 10}
    },
    "respuesta_rapida": {
        "name": "Respuesta Rápida",
        "description": "Respondes en menos de 1 hora",
        "icon": "Clock",
        "criteria": {"avg_response_time": 60}  # minutos
    },
    "vendedor_estrella": {
        "name": "Vendedor Estrella",
        "description": "50+ ventas completadas",
        "icon": "Star",
        "criteria": {"sales_count": 50}
    },
    "popular": {
        "name": "Pulpería Popular",
        "description": "100+ visitas a tu perfil",
        "icon": "Users",
        "criteria": {"profile_views": 100}
    },
    "en_ascenso": {
        "name": "En Ascenso",
        "description": "Crecimiento constante",
        "icon": "TrendingUp",
        "criteria": {"growth_rate": 10}  # 10% mensual
    },
    "verificado": {
        "name": "Verificado",
        "description": "Negocio verificado oficialmente",
        "icon": "BadgeCheck",
        "criteria": {"is_verified": True}
    },
    "top_vendedor": {
        "name": "Top Vendedor",
        "description": "Top 10 del mes",
        "icon": "Trophy",
        "criteria": {"top_rank": 10},
        "tier": "legendary"
    },
    "leyenda": {
        "name": "Leyenda Local",
        "description": "Referente de tu comunidad",
        "icon": "Crown",
        "criteria": {"community_score": 100},
        "tier": "legendary"
    }
}

class PulperiaAchievement(BaseModel):
    achievement_id: str
    pulperia_id: str
    badge_id: str  # ID del badge (primera_venta, cliente_feliz, etc.)
    unlocked_at: datetime
    
class PulperiaStats(BaseModel):
    pulperia_id: str
    sales_count: int = 0
    products_count: int = 0
    profile_views: int = 0
    happy_customers: int = 0  # Clientes con rating >= 4
    avg_response_time: int = 999  # En minutos
    is_verified: bool = False
    updated_at: datetime

# ============================================
# REQUEST MODELS
# ============================================

class SessionRequest(BaseModel):
    session_id: str

class PulperiaCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: str
    location: dict
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    hours: Optional[str] = None
    image_url: Optional[str] = None
    logo_url: Optional[str] = None
    banner_url: Optional[str] = None
    title_font: Optional[str] = "default"
    background_color: Optional[str] = "#DC2626"
    badge: Optional[str] = None
    is_suspended: Optional[bool] = False
    suspension_reason: Optional[str] = None

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    available: bool = True
    category: Optional[str] = None
    image_url: Optional[str] = None

class ReviewCreate(BaseModel):
    rating: int
    comment: Optional[str] = None
    images: List[str] = []

class OrderCreate(BaseModel):
    customer_name: str  # Name for the order
    pulperia_id: str
    items: List[OrderItem]
    total: float
    order_type: Literal["online", "pickup"] = "pickup"

class OrderStatusUpdate(BaseModel):
    status: Literal["pending", "accepted", "ready", "completed", "cancelled"]

class JobCreate(BaseModel):
    title: str
    description: str
    category: str
    pay_rate: float
    pay_currency: Literal["HNL", "USD"]
    location: str
    contact: str
    pulperia_id: Optional[str] = None

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    hourly_rate: float
    rate_currency: Literal["HNL", "USD"]
    location: str
    contact: str
    images: List[str] = []

class AdvertisementCreate(BaseModel):
    plan: Literal["basico", "destacado", "premium", "recomendado"]
    payment_method: str
    payment_reference: Optional[str] = None

class AdminAdActivation(BaseModel):
    pulperia_id: str
    plan: Literal["basico", "destacado", "premium", "recomendado"]
    duration_days: int = 7

class UserTypeChange(BaseModel):
    new_type: Literal["cliente", "pulperia"]

# ============================================
# AUTHENTICATION HELPERS
# ============================================

async def get_current_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get current authenticated user from session token"""
    token = None
    
    if session_token:
        token = session_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="No autenticado")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Sesión inválida")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Sesión expirada")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Check if user is admin
    user_doc["is_admin"] = user_doc.get("email") == ADMIN_EMAIL
    
    return User(**user_doc)

async def get_admin_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get current user and verify admin access"""
    user = await get_current_user(authorization, session_token)
    if user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo el administrador puede acceder.")
    return user

# ============================================
# FUZZY SEARCH HELPER
# ============================================

def normalize_text(text: str) -> str:
    """Normalize text for fuzzy matching"""
    if not text:
        return ""
    # Remove accents and convert to lowercase
    text = text.lower()
    replacements = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'ü': 'u', 'ñ': 'n'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text

def create_search_pattern(search_term: str) -> str:
    """Create a flexible regex pattern for fuzzy search"""
    normalized = normalize_text(search_term)
    # Remove trailing 's' for singular/plural matching
    if normalized.endswith('s') and len(normalized) > 2:
        normalized = normalized[:-1]
    # Create pattern that matches the base term
    return normalized

async def fuzzy_search_products(search_term: str) -> list:
    """Search products with fuzzy matching"""
    base_pattern = create_search_pattern(search_term)
    
    # Search with multiple patterns
    products = await db.products.find(
        {
            "$or": [
                {"name": {"$regex": base_pattern, "$options": "i"}},
                {"name": {"$regex": f".*{base_pattern}.*", "$options": "i"}},
                {"description": {"$regex": base_pattern, "$options": "i"}},
                {"category": {"$regex": base_pattern, "$options": "i"}}
            ],
            "available": True
        },
        {"_id": 0}
    ).to_list(100)
    
    return products

# ============================================
# AUTHENTICATION ENDPOINTS
# ============================================

# Google OAuth configuration for custom domain
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
CUSTOM_DOMAIN = os.environ.get('CUSTOM_DOMAIN', 'lapulperiastore.net')

@api_router.get("/auth/google/url")
async def get_google_auth_url(redirect_uri: str):
    """Get Google OAuth URL for custom domain authentication"""
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    # Build Google OAuth URL
    google_auth_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return {"auth_url": f"{google_auth_url}?{query_string}"}

@api_router.post("/auth/google/callback")
async def google_oauth_callback(code: str, redirect_uri: str, response: Response):
    """Handle Google OAuth callback and create session"""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    logger.info("[AUTH] Processing Google OAuth callback")
    
    async with httpx.AsyncClient() as http_client:
        try:
            # Exchange code for tokens
            token_response = await http_client.post(
                "https://oauth2.googleapis.com/token",
                data={
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "code": code,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                },
                timeout=15
            )
            token_response.raise_for_status()
            tokens = token_response.json()
            
            # Get user info
            userinfo_response = await http_client.get(
                "https://www.googleapis.com/oauth2/v2/userinfo",
                headers={"Authorization": f"Bearer {tokens['access_token']}"},
                timeout=15
            )
            userinfo_response.raise_for_status()
            user_info = userinfo_response.json()
            
            logger.info(f"[AUTH] Google OAuth successful for: {user_info.get('email')}")
            
        except httpx.HTTPStatusError as e:
            logger.error(f"[AUTH] Google OAuth failed: {e.response.status_code} - {e.response.text}")
            raise HTTPException(status_code=401, detail="Autenticación con Google fallida")
        except Exception as e:
            logger.error(f"[AUTH] Google OAuth error: {str(e)}")
            raise HTTPException(status_code=502, detail="Error del servicio de autenticación")
    
    # Create or update user
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = f"sess_{uuid.uuid4().hex}"
    
    existing_user = await db.users.find_one({"email": user_info["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        logger.info(f"[AUTH] Existing user: {user_id}")
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": user_info.get("name", ""),
                "picture": user_info.get("picture", "")
            }}
        )
        is_new_user = False
    else:
        logger.info(f"[AUTH] Creating new user: {user_id}")
        user_doc = {
            "user_id": user_id,
            "email": user_info["email"],
            "name": user_info.get("name", ""),
            "picture": user_info.get("picture", ""),
            "user_type": None,
            "location": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        is_new_user = True
    
    # Create session
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    logger.info(f"[AUTH] Session created for: {user_id}")
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user["is_new_user"] = is_new_user
    user["is_admin"] = user.get("email") == ADMIN_EMAIL
    user["session_token"] = session_token
    return user

@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    """Create user session from Emergent Auth session_id"""
    logger.info("[AUTH] Processing session request")
    
    async with httpx.AsyncClient() as http_client:
        try:
            emergent_response = await http_client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": request.session_id},
                timeout=15
            )
            emergent_response.raise_for_status()
            auth_data = emergent_response.json()
            logger.info(f"[AUTH] Google OAuth successful for: {auth_data.get('email')}")
        except httpx.HTTPStatusError as e:
            logger.error(f"[AUTH] Auth validation failed: {e.response.status_code}")
            raise HTTPException(status_code=401, detail="Autenticación fallida")
        except Exception as e:
            logger.error(f"[AUTH] Auth service error: {str(e)}")
            raise HTTPException(status_code=502, detail="Error del servicio de autenticación")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = auth_data["session_token"]
    
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        logger.info(f"[AUTH] Existing user: {user_id}")
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data["picture"]
            }}
        )
        is_new_user = False
    else:
        logger.info(f"[AUTH] Creating new user: {user_id}")
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data["picture"],
            "user_type": None,
            "location": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(user_doc)
        is_new_user = True
    
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    logger.info(f"[AUTH] Session created for: {user_id}")
    
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7 * 24 * 60 * 60,
        path="/"
    )
    
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    user["is_new_user"] = is_new_user
    user["is_admin"] = user.get("email") == ADMIN_EMAIL
    return user

@api_router.get("/auth/me")
async def get_me(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get current authenticated user"""
    user = await get_current_user(authorization, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Logout user and clear session"""
    token = session_token or (authorization.replace("Bearer ", "") if authorization else None)
    
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Sesión cerrada exitosamente"}

@api_router.post("/auth/set-user-type")
async def set_user_type(user_type: Literal["cliente", "pulperia"], authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Set user type (cliente or pulperia)"""
    user = await get_current_user(authorization, session_token)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"user_type": user_type}}
    )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    updated_user["is_admin"] = updated_user.get("email") == ADMIN_EMAIL
    return updated_user

@api_router.post("/auth/change-user-type")
async def change_user_type(type_change: UserTypeChange, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Change user type between cliente and pulperia"""
    user = await get_current_user(authorization, session_token)
    
    # If changing to cliente from pulperia, update name to pulperia name if they have one
    new_name = user.name
    if type_change.new_type == "cliente" and user.user_type == "pulperia":
        pulperia = await db.pulperias.find_one({"owner_user_id": user.user_id}, {"_id": 0})
        if pulperia:
            new_name = pulperia["name"]
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"user_type": type_change.new_type, "name": new_name}}
    )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    updated_user["is_admin"] = updated_user.get("email") == ADMIN_EMAIL
    return updated_user

# ============================================
# PULPERIA ENDPOINTS
# ============================================

@api_router.get("/pulperias")
async def get_pulperias(lat: Optional[float] = None, lng: Optional[float] = None, search: Optional[str] = None, sort_by: Optional[str] = None):
    """Get all pulperias with optional search and sorting"""
    query = {}
    if search:
        pattern = create_search_pattern(search)
        query["$or"] = [
            {"name": {"$regex": pattern, "$options": "i"}},
            {"address": {"$regex": pattern, "$options": "i"}}
        ]
    
    sort_options = [("created_at", -1)]
    if sort_by == "rating":
        sort_options = [("rating", -1)]
    
    pulperias = await db.pulperias.find(query, {"_id": 0}).sort(sort_options).to_list(100)
    return pulperias

@api_router.get("/pulperias/{pulperia_id}")
async def get_pulperia(pulperia_id: str):
    """Get single pulperia by ID"""
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    return pulperia

@api_router.post("/pulperias")
async def create_pulperia(pulperia_data: PulperiaCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new pulperia"""
    user = await get_current_user(authorization, session_token)
    
    if user.user_type != "pulperia":
        raise HTTPException(status_code=403, detail="Solo usuarios tipo pulpería pueden crear pulperías")
    
    pulperia_id = f"pulperia_{uuid.uuid4().hex[:12]}"
    pulperia_doc = {
        "pulperia_id": pulperia_id,
        "owner_user_id": user.user_id,
        **pulperia_data.model_dump(),
        "rating": 0.0,
        "review_count": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.pulperias.insert_one(pulperia_doc)
    return await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})

@api_router.put("/pulperias/{pulperia_id}")
async def update_pulperia(pulperia_id: str, pulperia_data: PulperiaCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Update pulperia"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta pulpería")
    
    # Get all data including None values to properly update
    update_data = pulperia_data.model_dump(exclude_unset=False)
    
    # Log for debugging
    logger.info(f"[PULPERIA UPDATE] Updating {pulperia_id} with banner_url: {update_data.get('banner_url', 'NOT SET')}")
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": update_data}
    )
    
    return await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})

@api_router.get("/pulperias/{pulperia_id}/products")
async def get_pulperia_products(pulperia_id: str):
    """Get all products for a pulperia"""
    products = await db.products.find({"pulperia_id": pulperia_id}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/pulperias/{pulperia_id}/reviews")
async def get_pulperia_reviews(pulperia_id: str):
    """Get all reviews for a pulperia"""
    reviews = await db.reviews.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/pulperias/{pulperia_id}/reviews")
async def create_review(pulperia_id: str, review_data: ReviewCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a review for a pulperia"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    existing_review = await db.reviews.find_one({"pulperia_id": pulperia_id, "user_id": user.user_id}, {"_id": 0})
    if existing_review:
        raise HTTPException(status_code=400, detail="Ya has dejado una review para esta pulpería")
    
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating debe estar entre 1 y 5")
    
    images = review_data.images[:2] if review_data.images else []
    
    review_id = f"review_{uuid.uuid4().hex[:12]}"
    review_doc = {
        "review_id": review_id,
        "pulperia_id": pulperia_id,
        "user_id": user.user_id,
        "user_name": user.name,
        "rating": review_data.rating,
        "comment": review_data.comment,
        "images": images,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    all_reviews = await db.reviews.find({"pulperia_id": pulperia_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return await db.reviews.find_one({"review_id": review_id}, {"_id": 0})

@api_router.get("/pulperias/{pulperia_id}/announcements")
async def get_pulperia_announcements(pulperia_id: str):
    """Get all announcements for a pulperia"""
    announcements = await db.announcements.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return announcements

class AnnouncementCreate(BaseModel):
    content: str = ""
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None

@api_router.post("/pulperias/{pulperia_id}/announcements")
async def create_announcement(pulperia_id: str, data: AnnouncementCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create an announcement for a pulperia"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede crear anuncios")
    
    announcement_id = f"ann_{uuid.uuid4().hex[:12]}"
    announcement_doc = {
        "announcement_id": announcement_id,
        "pulperia_id": pulperia_id,
        "content": data.content,
        "image_url": data.image_url,
        "tags": data.tags or [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.announcements.insert_one(announcement_doc)
    return await db.announcements.find_one({"announcement_id": announcement_id}, {"_id": 0})

@api_router.delete("/announcements/{announcement_id}")
async def delete_announcement(announcement_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Delete an announcement"""
    user = await get_current_user(authorization, session_token)
    
    announcement = await db.announcements.find_one({"announcement_id": announcement_id}, {"_id": 0})
    if not announcement:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": announcement["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="Solo el dueño puede eliminar anuncios")
    
    await db.announcements.delete_one({"announcement_id": announcement_id})
    return {"message": "Anuncio eliminado"}

@api_router.get("/pulperias/{pulperia_id}/jobs")
async def get_pulperia_jobs(pulperia_id: str):
    """Get all jobs for a pulperia"""
    jobs = await db.jobs.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return jobs

# ============================================
# PRODUCT ENDPOINTS
# ============================================

@api_router.get("/products")
async def search_products(search: Optional[str] = None, category: Optional[str] = None, sort_by: Optional[str] = None):
    """Search products across all pulperias with fuzzy matching"""
    
    if search:
        products = await fuzzy_search_products(search)
    else:
        query = {"available": True}
        if category:
            query["category"] = category
        products = await db.products.find(query, {"_id": 0}).to_list(100)
    
    # Sort results
    if sort_by == "price_asc":
        products.sort(key=lambda x: x.get("price", 0))
    elif sort_by == "price_desc":
        products.sort(key=lambda x: x.get("price", 0), reverse=True)
    
    # Enrich with pulperia info
    pulperia_ids = list(set(p["pulperia_id"] for p in products))
    if pulperia_ids:
        pulperias_list = await db.pulperias.find(
            {"pulperia_id": {"$in": pulperia_ids}},
            {"_id": 0, "pulperia_id": 1, "name": 1, "logo_url": 1}
        ).to_list(len(pulperia_ids))
        pulperias_dict = {p["pulperia_id"]: p for p in pulperias_list}
        
        for product in products:
            pulperia = pulperias_dict.get(product["pulperia_id"])
            if pulperia:
                product["pulperia_name"] = pulperia["name"]
                product["pulperia_logo"] = pulperia.get("logo_url")
    
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    """Get single product by ID"""
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@api_router.post("/products")
async def create_product(product_data: ProductCreate, pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new product"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para agregar productos a esta pulpería")
    
    product_id = f"product_{uuid.uuid4().hex[:12]}"
    product_doc = {
        "product_id": product_id,
        "pulperia_id": pulperia_id,
        **product_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.products.insert_one(product_doc)
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

@api_router.put("/products/{product_id}")
async def update_product(product_id: str, product_data: ProductCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Update product"""
    user = await get_current_user(authorization, session_token)
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": product["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este producto")
    
    await db.products.update_one(
        {"product_id": product_id},
        {"$set": product_data.model_dump()}
    )
    
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Delete product"""
    user = await get_current_user(authorization, session_token)
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": product["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este producto")
    
    await db.products.delete_one({"product_id": product_id})
    return {"message": "Producto eliminado exitosamente"}

@api_router.put("/products/{product_id}/availability")
async def toggle_product_availability(product_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Toggle product availability"""
    user = await get_current_user(authorization, session_token)
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": product["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este producto")
    
    new_available = not product.get("available", True)
    
    await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"available": new_available}}
    )
    
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

# ============================================
# ACHIEVEMENT SYSTEM ENDPOINTS
# ============================================

async def calculate_pulperia_stats(pulperia_id: str) -> dict:
    """Calculate statistics for a pulperia to determine achievements"""
    # Contar productos
    products_count = await db.products.count_documents({"pulperia_id": pulperia_id})
    
    # Contar ventas completadas
    sales_count = await db.orders.count_documents({
        "pulperia_id": pulperia_id,
        "status": "completed"
    })
    
    # Contar clientes felices (reviews con rating >= 4)
    happy_customers = await db.reviews.count_documents({
        "pulperia_id": pulperia_id,
        "rating": {"$gte": 4}
    })
    
    # Obtener visitas al perfil (si existe el contador)
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    profile_views = pulperia.get("profile_views", 0) if pulperia else 0
    
    # Verificar si está verificado
    is_verified = pulperia.get("is_verified", False) if pulperia else False
    
    return {
        "pulperia_id": pulperia_id,
        "products_count": products_count,
        "sales_count": sales_count,
        "happy_customers": happy_customers,
        "profile_views": profile_views,
        "is_verified": is_verified,
        "avg_response_time": 999,  # Placeholder
        "growth_rate": 0,  # Placeholder
        "community_score": 0,  # Placeholder
        "top_rank": 999  # Placeholder
    }

async def check_and_award_achievements(pulperia_id: str) -> list:
    """Check stats and award any new achievements"""
    stats = await calculate_pulperia_stats(pulperia_id)
    
    # Obtener logros ya desbloqueados
    existing_achievements = await db.achievements.find(
        {"pulperia_id": pulperia_id},
        {"_id": 0, "badge_id": 1}
    ).to_list(100)
    existing_badges = {a["badge_id"] for a in existing_achievements}
    
    new_achievements = []
    
    # Verificar cada logro
    for badge_id, definition in ACHIEVEMENT_DEFINITIONS.items():
        if badge_id in existing_badges:
            continue
        
        criteria = definition.get("criteria", {})
        unlocked = True
        
        for key, value in criteria.items():
            stat_value = stats.get(key, 0)
            
            if key == "is_verified":
                if stat_value != value:
                    unlocked = False
                    break
            elif key in ["avg_response_time"]:
                # Menor es mejor
                if stat_value > value:
                    unlocked = False
                    break
            else:
                # Mayor es mejor
                if stat_value < value:
                    unlocked = False
                    break
        
        if unlocked:
            achievement_id = f"achievement_{uuid.uuid4().hex[:12]}"
            achievement_doc = {
                "achievement_id": achievement_id,
                "pulperia_id": pulperia_id,
                "badge_id": badge_id,
                "unlocked_at": datetime.now(timezone.utc).isoformat()
            }
            await db.achievements.insert_one(achievement_doc)
            new_achievements.append({
                "badge_id": badge_id,
                "name": definition["name"],
                "description": definition["description"],
                "tier": definition.get("tier", "gold"),
                "unlocked_at": achievement_doc["unlocked_at"]
            })
    
    return new_achievements

@api_router.get("/achievements/definitions")
async def get_achievement_definitions():
    """Get all available achievement definitions"""
    return ACHIEVEMENT_DEFINITIONS

@api_router.get("/pulperias/{pulperia_id}/achievements")
async def get_pulperia_achievements(pulperia_id: str):
    """Get all achievements for a pulperia"""
    achievements = await db.achievements.find(
        {"pulperia_id": pulperia_id},
        {"_id": 0}
    ).to_list(100)
    
    # Enrich with definition data
    result = []
    for ach in achievements:
        badge_id = ach.get("badge_id")
        definition = ACHIEVEMENT_DEFINITIONS.get(badge_id, {})
        result.append({
            **ach,
            "name": definition.get("name", badge_id),
            "description": definition.get("description", ""),
            "icon": definition.get("icon", "Star"),
            "tier": definition.get("tier", "gold")
        })
    
    return result

@api_router.get("/pulperias/{pulperia_id}/stats")
async def get_pulperia_stats(pulperia_id: str):
    """Get statistics for a pulperia"""
    stats = await calculate_pulperia_stats(pulperia_id)
    return stats

@api_router.post("/pulperias/{pulperia_id}/check-achievements")
async def check_achievements(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Check and award new achievements for a pulperia"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    # Solo el dueño puede verificar logros
    if pulperia["owner_user_id"] != user.user_id and user.email != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    
    new_achievements = await check_and_award_achievements(pulperia_id)
    
    return {
        "new_achievements": new_achievements,
        "message": f"Se desbloquearon {len(new_achievements)} nuevos logros" if new_achievements else "No hay nuevos logros disponibles"
    }

@api_router.post("/pulperias/{pulperia_id}/increment-views")
async def increment_profile_views(pulperia_id: str):
    """Increment the profile view counter for a pulperia"""
    result = await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$inc": {"profile_views": 1}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    return {"message": "Vista registrada"}

@api_router.post("/admin/pulperias/{pulperia_id}/verify")
async def verify_pulperia(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Verify a pulperia (unlocks 'verificado' achievement)"""
    user = await get_admin_user(authorization, session_token)
    
    result = await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {"is_verified": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    # Check achievements after verification
    new_achievements = await check_and_award_achievements(pulperia_id)
    
    return {
        "message": "Pulpería verificada",
        "new_achievements": new_achievements
    }

@api_router.post("/admin/pulperias/{pulperia_id}/award-badge")
async def admin_award_badge(pulperia_id: str, badge_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Manually award a badge to a pulperia"""
    user = await get_admin_user(authorization, session_token)
    
    if badge_id not in ACHIEVEMENT_DEFINITIONS:
        raise HTTPException(status_code=400, detail="Badge inválido")
    
    # Check if already has badge
    existing = await db.achievements.find_one({
        "pulperia_id": pulperia_id,
        "badge_id": badge_id
    })
    
    if existing:
        raise HTTPException(status_code=400, detail="La pulpería ya tiene este logro")
    
    achievement_id = f"achievement_{uuid.uuid4().hex[:12]}"
    achievement_doc = {
        "achievement_id": achievement_id,
        "pulperia_id": pulperia_id,
        "badge_id": badge_id,
        "awarded_by": user.user_id,
        "unlocked_at": datetime.now(timezone.utc).isoformat()
    }
    await db.achievements.insert_one(achievement_doc)
    
    definition = ACHIEVEMENT_DEFINITIONS[badge_id]
    return {
        "message": f"Logro '{definition['name']}' otorgado exitosamente",
        "achievement": {
            **achievement_doc,
            "name": definition["name"],
            "description": definition["description"]
        }
    }

# ============================================
# FAVORITES ENDPOINTS
# ============================================

@api_router.get("/favorites")
async def get_favorites(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get user's favorite pulperias"""
    user = await get_current_user(authorization, session_token)
    
    favorites = await db.favorites.find({"user_id": user.user_id}, {"_id": 0}).to_list(100)
    pulperia_ids = [f["pulperia_id"] for f in favorites]
    
    if not pulperia_ids:
        return []
    
    pulperias = await db.pulperias.find({"pulperia_id": {"$in": pulperia_ids}}, {"_id": 0}).to_list(100)
    return pulperias

@api_router.post("/favorites/{pulperia_id}")
async def add_favorite(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Add a pulperia to favorites"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    existing = await db.favorites.find_one({"user_id": user.user_id, "pulperia_id": pulperia_id})
    if existing:
        return {"message": "Ya está en favoritos", "is_favorite": True}
    
    await db.favorites.insert_one({
        "user_id": user.user_id,
        "pulperia_id": pulperia_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"message": "Agregado a favoritos", "is_favorite": True}

@api_router.delete("/favorites/{pulperia_id}")
async def remove_favorite(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Remove a pulperia from favorites"""
    user = await get_current_user(authorization, session_token)
    
    await db.favorites.delete_one({"user_id": user.user_id, "pulperia_id": pulperia_id})
    return {"message": "Eliminado de favoritos", "is_favorite": False}

@api_router.get("/favorites/{pulperia_id}/check")
async def check_favorite(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Check if a pulperia is in favorites"""
    user = await get_current_user(authorization, session_token)
    
    existing = await db.favorites.find_one({"user_id": user.user_id, "pulperia_id": pulperia_id})
    return {"is_favorite": existing is not None}

# ORDER ENDPOINTS
# ============================================

@api_router.get("/orders")
async def get_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get orders for current user"""
    user = await get_current_user(authorization, session_token)
    
    if user.user_type == "cliente":
        orders = await db.orders.find({"customer_user_id": user.user_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    else:
        user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
        pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
        orders = await db.orders.find({"pulperia_id": {"$in": pulperia_ids}}, {"_id": 0}).sort("created_at", -1).to_list(100)
    
    return orders

@api_router.post("/orders")
async def create_order(order_data: OrderCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new order"""
    user = await get_current_user(authorization, session_token)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "customer_user_id": user.user_id,
        "customer_name": order_data.customer_name,  # Name for the order
        "pulperia_id": order_data.pulperia_id,
        "items": [item.model_dump() for item in order_data.items],
        "total": order_data.total,
        "order_type": order_data.order_type,
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    await broadcast_order_update(order, "new_order")
    
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Update order status"""
    user = await get_current_user(authorization, session_token)
    
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Orden no encontrada")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": order["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id and order["customer_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para actualizar esta orden")
    
    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {"status": status_update.status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    updated_order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    event_type = "cancelled" if status_update.status == "cancelled" else "status_changed"
    await broadcast_order_update(updated_order, event_type)
    
    return updated_order

@api_router.get("/orders/completed")
async def get_completed_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get completed orders"""
    user = await get_current_user(authorization, session_token)
    
    if user.user_type == "pulperia":
        user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
        pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
        orders = await db.orders.find(
            {"pulperia_id": {"$in": pulperia_ids}, "status": "completed"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
    else:
        orders = await db.orders.find(
            {"customer_user_id": user.user_id, "status": "completed"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(1000)
    
    return orders

@api_router.get("/orders/stats")
async def get_order_stats(period: str = "day", authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get order statistics for pulperia owners"""
    user = await get_current_user(authorization, session_token)
    
    if user.user_type != "pulperia":
        raise HTTPException(status_code=403, detail="Solo pulperías pueden ver estadísticas")
    
    user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
    pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
    
    now = datetime.now(timezone.utc)
    if period == "day":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
    
    orders = await db.orders.find(
        {
            "pulperia_id": {"$in": pulperia_ids},
            "status": "completed",
            "created_at": {"$gte": start_date.isoformat()}
        },
        {"_id": 0}
    ).to_list(10000)
    
    total_orders = len(orders)
    total_revenue = sum(order["total"] for order in orders)
    
    product_counts = {}
    for order in orders:
        for item in order.get("items", []):
            product_name = item.get("product_name", "Unknown")
            if product_name in product_counts:
                product_counts[product_name] += item.get("quantity", 1)
            else:
                product_counts[product_name] = item.get("quantity", 1)
    
    top_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "period": period,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "average_order": total_revenue / total_orders if total_orders > 0 else 0,
        "top_products": [{"name": name, "quantity": qty} for name, qty in top_products],
        "orders": orders
    }

@api_router.get("/notifications")
async def get_notifications(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get notifications for current user - shows recent orders with full details"""
    user = await get_current_user(authorization, session_token)
    
    # Get user's read notifications
    read_notifications = await db.read_notifications.find(
        {"user_id": user.user_id},
        {"_id": 0, "notification_id": 1}
    ).to_list(100)
    read_ids = set(n["notification_id"] for n in read_notifications)
    
    notifications = []
    
    if user.user_type == "cliente":
        # Clients see their own orders
        orders = await db.orders.find(
            {"customer_user_id": user.user_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(20)
        
        # Get pulperia names for orders
        pulperia_ids = list(set(o.get("pulperia_id") for o in orders if o.get("pulperia_id")))
        pulperias = await db.pulperias.find({"pulperia_id": {"$in": pulperia_ids}}, {"_id": 0, "pulperia_id": 1, "name": 1}).to_list(100)
        pulperia_map = {p["pulperia_id"]: p["name"] for p in pulperias}
        
        for order in orders:
            items = order.get("items", [])
            total_items = sum(item.get("quantity", 1) for item in items)
            pulperia_name = pulperia_map.get(order.get("pulperia_id"), "Pulpería")
            
            # Create item summary (e.g., "2x Pan, 1x Leche")
            item_summary = ", ".join([f"{item.get('quantity', 1)}x {item.get('product_name', 'Producto')}" for item in items[:3]])
            if len(items) > 3:
                item_summary += f" +{len(items) - 3} más"
            
            notification_id = order["order_id"]
            is_read = notification_id in read_ids
            
            notifications.append({
                "id": notification_id,
                "type": "order_status",
                "title": f"Orden en {pulperia_name}",
                "message": item_summary or "Sin productos",
                "status": order.get("status", "pending"),
                "created_at": order.get("created_at"),
                "order_id": order["order_id"],
                "items": items,
                "total": order.get("total", 0),
                "total_items": total_items,
                "pulperia_name": pulperia_name,
                "role": "customer",
                "read": is_read
            })
    else:
        # Pulperia owners see orders received
        user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
        pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
        pulperia_map = {p["pulperia_id"]: p["name"] for p in user_pulperias}
        
        orders = await db.orders.find(
            {"pulperia_id": {"$in": pulperia_ids}},
            {"_id": 0}
        ).sort("created_at", -1).to_list(20)
        
        for order in orders:
            customer_name = order.get("customer_name", "Cliente")
            items = order.get("items", [])
            total_items = sum(item.get("quantity", 1) for item in items)
            pulperia_name = pulperia_map.get(order.get("pulperia_id"), "Tu Pulpería")
            
            # Create item summary
            item_summary = ", ".join([f"{item.get('quantity', 1)}x {item.get('product_name', 'Producto')}" for item in items[:3]])
            if len(items) > 3:
                item_summary += f" +{len(items) - 3} más"
            
            notification_id = order["order_id"]
            is_read = notification_id in read_ids
            
            notifications.append({
                "id": notification_id,
                "type": "new_order" if order.get("status") == "pending" else "order_update",
                "title": f"Pedido de {customer_name}",
                "message": item_summary or "Sin productos",
                "status": order.get("status", "pending"),
                "created_at": order.get("created_at"),
                "order_id": order["order_id"],
                "customer_name": customer_name,
                "items": items,
                "total": order.get("total", 0),
                "total_items": total_items,
                "pulperia_name": pulperia_name,
                "role": "owner",
                "read": is_read
            })
    
    return notifications


@api_router.post("/notifications/mark-read")
async def mark_notifications_read(notification_ids: List[str], authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Mark notifications as read"""
    user = await get_current_user(authorization, session_token)
    
    for nid in notification_ids:
        await db.read_notifications.update_one(
            {"user_id": user.user_id, "notification_id": nid},
            {"$set": {"user_id": user.user_id, "notification_id": nid, "read_at": datetime.now(timezone.utc)}},
            upsert=True
        )
    
    return {"success": True, "marked": len(notification_ids)}

# ============================================
# JOB ENDPOINTS
# ============================================

@api_router.get("/jobs")
async def get_jobs(category: Optional[str] = None, search: Optional[str] = None):
    """Get all jobs"""
    query = {}
    if category:
        query["category"] = category
    if search:
        pattern = create_search_pattern(search)
        query["$or"] = [
            {"title": {"$regex": pattern, "$options": "i"}},
            {"description": {"$regex": pattern, "$options": "i"}}
        ]
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.post("/jobs")
async def create_job(job_data: JobCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new job posting"""
    user = await get_current_user(authorization, session_token)
    
    pulperia_name = None
    pulperia_logo = None
    if job_data.pulperia_id:
        pulperia = await db.pulperias.find_one({"pulperia_id": job_data.pulperia_id}, {"_id": 0})
        if pulperia and pulperia["owner_user_id"] == user.user_id:
            pulperia_name = pulperia["name"]
            pulperia_logo = pulperia.get("logo_url")
    
    job_id = f"job_{uuid.uuid4().hex[:12]}"
    job_doc = {
        "job_id": job_id,
        "employer_user_id": user.user_id,
        "employer_name": user.name,
        "pulperia_id": job_data.pulperia_id,
        "pulperia_name": pulperia_name,
        "pulperia_logo": pulperia_logo,
        **{k: v for k, v in job_data.model_dump().items() if k != 'pulperia_id'},
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.jobs.insert_one(job_doc)
    return await db.jobs.find_one({"job_id": job_id}, {"_id": 0})

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Delete a job posting"""
    user = await get_current_user(authorization, session_token)
    
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Empleo no encontrado")
    
    if job["employer_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este empleo")
    
    await db.jobs.delete_one({"job_id": job_id})
    await db.job_applications.delete_many({"job_id": job_id})
    return {"message": "Empleo eliminado"}

# ============================================
# SERVICE ENDPOINTS
# ============================================

@api_router.get("/services")
async def get_services(category: Optional[str] = None, search: Optional[str] = None):
    """Get all services"""
    query = {}
    if category:
        query["category"] = category
    if search:
        pattern = create_search_pattern(search)
        query["$or"] = [
            {"title": {"$regex": pattern, "$options": "i"}},
            {"description": {"$regex": pattern, "$options": "i"}}
        ]
    
    services = await db.services.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return services

@api_router.post("/services")
async def create_service(service_data: ServiceCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new service"""
    user = await get_current_user(authorization, session_token)
    
    service_id = f"service_{uuid.uuid4().hex[:12]}"
    service_doc = {
        "service_id": service_id,
        "provider_user_id": user.user_id,
        "provider_name": user.name,
        **service_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.services.insert_one(service_doc)
    return await db.services.find_one({"service_id": service_id}, {"_id": 0})

@api_router.delete("/services/{service_id}")
async def delete_service(service_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Delete a service"""
    user = await get_current_user(authorization, session_token)
    
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    if service["provider_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este servicio")
    
    await db.services.delete_one({"service_id": service_id})
    return {"message": "Servicio eliminado"}

# ============================================
# ADVERTISING ENDPOINTS
# ============================================

AD_PLANS = {
    "basico": {"price": 200, "duration": 7, "name": "Básico", "features": ["Aparece en lista destacada"]},
    "destacado": {"price": 400, "duration": 15, "name": "Destacado", "features": ["Aparece primero en búsquedas", "Badge destacado"]},
    "premium": {"price": 600, "duration": 30, "name": "Premium", "features": ["Aparece primero", "Badge premium", "Banner en inicio"]},
    "recomendado": {"price": 1000, "duration": 30, "name": "Recomendado", "features": ["Aparece en Pulperías Recomendadas", "Badge exclusivo", "Máxima visibilidad", "Prioridad en mapa"]}
}

@api_router.get("/ads/plans")
async def get_ad_plans():
    """Get available advertising plans"""
    return AD_PLANS

@api_router.get("/ads/featured")
async def get_featured_pulperias():
    """Get featured/advertised pulperias"""
    now = datetime.now(timezone.utc)
    
    active_ads = await db.advertisements.find(
        {"status": "active", "end_date": {"$gte": now.isoformat()}},
        {"_id": 0}
    ).sort([("plan", -1), ("created_at", -1)]).to_list(20)
    
    featured = []
    for ad in active_ads:
        pulperia = await db.pulperias.find_one({"pulperia_id": ad["pulperia_id"]}, {"_id": 0})
        if pulperia:
            pulperia["ad_plan"] = ad["plan"]
            featured.append(pulperia)
    
    return featured


@api_router.get("/ads/recommended")
async def get_recommended_pulperias():
    """Get pulperias with 'recomendado' plan - Premium tier for featured section"""
    now = datetime.now(timezone.utc)
    
    # Only get ads with 'recomendado' plan that are active
    active_ads = await db.advertisements.find(
        {
            "status": "active", 
            "plan": "recomendado",
            "end_date": {"$gte": now.isoformat()}
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(50)
    
    recommended = []
    for ad in active_ads:
        pulperia = await db.pulperias.find_one({"pulperia_id": ad["pulperia_id"]}, {"_id": 0})
        if pulperia:
            pulperia["ad_plan"] = "recomendado"
            pulperia["ad_end_date"] = ad.get("end_date")
            recommended.append(pulperia)
    
    return recommended

@api_router.get("/ads/my-ads")
async def get_my_ads(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get ads for current user's pulperias"""
    user = await get_current_user(authorization, session_token)
    
    user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
    pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
    
    ads = await db.advertisements.find(
        {"pulperia_id": {"$in": pulperia_ids}},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return ads

@api_router.post("/ads/create")
async def create_advertisement(ad_data: AdvertisementCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create a new advertisement request"""
    user = await get_current_user(authorization, session_token)
    
    if user.user_type != "pulperia":
        raise HTTPException(status_code=403, detail="Solo pulperías pueden crear anuncios")
    
    pulperia = await db.pulperias.find_one({"owner_user_id": user.user_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="No tienes una pulpería registrada")
    
    plan_info = AD_PLANS.get(ad_data.plan)
    if not plan_info:
        raise HTTPException(status_code=400, detail="Plan inválido")
    
    ad_id = f"ad_{uuid.uuid4().hex[:12]}"
    ad_doc = {
        "ad_id": ad_id,
        "pulperia_id": pulperia["pulperia_id"],
        "pulperia_name": pulperia["name"],
        "plan": ad_data.plan,
        "status": "pending",
        "payment_method": ad_data.payment_method,
        "payment_reference": ad_data.payment_reference,
        "amount": plan_info["price"],
        "duration_days": plan_info["duration"],
        "start_date": None,
        "end_date": None,
        "assigned_by": None,
        "assigned_at": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.advertisements.insert_one(ad_doc)
    return await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})

@api_router.get("/ads/assignment-log")
async def get_ad_assignment_log():
    """Get public log of ad assignments"""
    logs = await db.ad_assignment_logs.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return logs

# ============================================
# ADMIN ENDPOINTS
# ============================================

@api_router.get("/admin/pulperias")
async def admin_get_all_pulperias(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Get all pulperias for ad management"""
    await get_admin_user(authorization, session_token)
    pulperias = await db.pulperias.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return pulperias

@api_router.get("/admin/ads")
async def admin_get_all_ads(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Get all advertisements"""
    await get_admin_user(authorization, session_token)
    ads = await db.advertisements.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return ads

@api_router.post("/admin/ads/activate")
async def admin_activate_ad(activation: AdminAdActivation, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Activate an ad for a pulperia"""
    admin = await get_admin_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": activation.pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    # Check for existing active ad
    existing = await db.advertisements.find_one({
        "pulperia_id": activation.pulperia_id,
        "status": "active"
    }, {"_id": 0})
    
    if existing:
        # Update existing ad
        now = datetime.now(timezone.utc)
        end_date = now + timedelta(days=activation.duration_days)
        
        await db.advertisements.update_one(
            {"ad_id": existing["ad_id"]},
            {"$set": {
                "plan": activation.plan,
                "end_date": end_date.isoformat(),
                "assigned_by": admin.email,
                "assigned_at": now.isoformat()
            }}
        )
        ad_id = existing["ad_id"]
    else:
        # Create new ad
        now = datetime.now(timezone.utc)
        end_date = now + timedelta(days=activation.duration_days)
        
        ad_id = f"ad_{uuid.uuid4().hex[:12]}"
        ad_doc = {
            "ad_id": ad_id,
            "pulperia_id": activation.pulperia_id,
            "pulperia_name": pulperia["name"],
            "plan": activation.plan,
            "status": "active",
            "payment_method": "admin_assigned",
            "payment_reference": None,
            "amount": 0,
            "duration_days": activation.duration_days,
            "start_date": now.isoformat(),
            "end_date": end_date.isoformat(),
            "assigned_by": admin.email,
            "assigned_at": now.isoformat(),
            "created_at": now.isoformat()
        }
        await db.advertisements.insert_one(ad_doc)
    
    # Log the assignment
    log_id = f"log_{uuid.uuid4().hex[:12]}"
    log_doc = {
        "log_id": log_id,
        "ad_id": ad_id,
        "pulperia_id": activation.pulperia_id,
        "pulperia_name": pulperia["name"],
        "plan": activation.plan,
        "action": "activated",
        "assigned_by": admin.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ad_assignment_logs.insert_one(log_doc)
    
    return await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})

@api_router.post("/admin/ads/{ad_id}/deactivate")
async def admin_deactivate_ad(ad_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Deactivate an ad"""
    admin = await get_admin_user(authorization, session_token)
    
    ad = await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})
    if not ad:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    await db.advertisements.update_one(
        {"ad_id": ad_id},
        {"$set": {"status": "expired"}}
    )
    
    # Log the deactivation
    log_id = f"log_{uuid.uuid4().hex[:12]}"
    log_doc = {
        "log_id": log_id,
        "ad_id": ad_id,
        "pulperia_id": ad["pulperia_id"],
        "pulperia_name": ad["pulperia_name"],
        "plan": ad["plan"],
        "action": "deactivated",
        "assigned_by": admin.email,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.ad_assignment_logs.insert_one(log_doc)
    
    return {"message": "Anuncio desactivado"}

@api_router.post("/admin/pulperias/{pulperia_id}/suspend")
async def admin_suspend_pulperia(pulperia_id: str, reason: str = "", days: int = 7, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Suspend a pulperia temporarily"""
    admin = await get_admin_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    suspend_until = datetime.now(timezone.utc) + timedelta(days=days)
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {
            "is_suspended": True, 
            "suspension_reason": reason, 
            "suspended_by": admin.email, 
            "suspended_at": datetime.now(timezone.utc).isoformat(),
            "suspend_until": suspend_until.isoformat(),
            "suspend_days": days
        }}
    )
    
    # Create admin message to notify pulperia
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "pulperia_id": pulperia_id,
        "pulperia_name": pulperia["name"],
        "from_admin": True,
        "sender": admin.email,
        "message": f"Tu pulpería ha sido suspendida por {days} días. Razón: {reason or 'No especificada'}. Podrás volver a operar el {suspend_until.strftime('%d/%m/%Y')}.",
        "read": False,
        "is_system_message": True,
        "message_type": "suspension",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admin_messages.insert_one(message_doc)
    
    return {"message": f"Pulpería suspendida por {days} días"}

@api_router.post("/admin/pulperias/{pulperia_id}/unsuspend")
async def admin_unsuspend_pulperia(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Unsuspend a pulperia"""
    admin = await get_admin_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {"is_suspended": False, "suspension_reason": None, "suspend_until": None, "suspend_days": None}}
    )
    
    # Create admin message to notify pulperia
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "pulperia_id": pulperia_id,
        "pulperia_name": pulperia["name"],
        "from_admin": True,
        "sender": admin.email,
        "message": "¡Tu pulpería ha sido reactivada! Ya puedes volver a operar normalmente.",
        "read": False,
        "is_system_message": True,
        "message_type": "reactivation",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.admin_messages.insert_one(message_doc)
    
    return {"message": "Pulpería reactivada"}

@api_router.post("/admin/pulperias/{pulperia_id}/badge")
async def admin_set_badge(pulperia_id: str, badge: str = "", authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Set a badge for a pulperia"""
    await get_admin_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {"badge": badge if badge else None}}
    )
    
    return {"message": "Badge actualizado"}

@api_router.post("/admin/pulperias/{pulperia_id}/message")
async def admin_send_message(pulperia_id: str, message: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Send a message to a pulperia"""
    admin = await get_admin_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "pulperia_id": pulperia_id,
        "pulperia_name": pulperia["name"],
        "from_admin": True,
        "sender": admin.email,
        "message": message,
        "read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.admin_messages.insert_one(message_doc)
    
    # Broadcast via WebSocket if pulperia owner is connected
    owner_id = pulperia.get("owner_user_id")
    if owner_id:
        await ws_manager.broadcast_to_user(owner_id, {
            "type": "admin_message",
            "message": message,
            "from": "Administrador"
        })
    
    return {"message": "Mensaje enviado", "message_id": message_id}

@api_router.get("/admin/messages")
async def admin_get_messages(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Get all admin messages"""
    await get_admin_user(authorization, session_token)
    
    messages = await db.admin_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return messages

@api_router.get("/pulperias/{pulperia_id}/admin-messages")
async def get_pulperia_admin_messages(pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get admin messages for a pulperia"""
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    
    messages = await db.admin_messages.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(50)
    
    # Mark as read
    await db.admin_messages.update_many(
        {"pulperia_id": pulperia_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return messages

# ============================================
# WEBSOCKET CONNECTION MANAGER
# ============================================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        self.connection_count: Dict[str, int] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
            self.connection_count[user_id] = 0
        
        self.active_connections[user_id].add(websocket)
        self.connection_count[user_id] += 1
        logger.info(f"WebSocket connected for user {user_id}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            self.connection_count[user_id] = max(0, self.connection_count.get(user_id, 1) - 1)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                del self.connection_count[user_id]
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message: {e}")
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        if user_id not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[user_id].copy():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to user {user_id}: {e}")
                disconnected.add(connection)
        
        for conn in disconnected:
            self.active_connections[user_id].discard(conn)
    
    def is_user_connected(self, user_id: str) -> bool:
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

ws_manager = ConnectionManager()

@app.websocket("/ws/orders/{user_id}")
async def websocket_orders_endpoint(websocket: WebSocket, user_id: str):
    if not user_id or len(user_id) < 5:
        await websocket.close(code=4001, reason="Invalid user_id")
        return
    
    await ws_manager.connect(websocket, user_id)
    
    try:
        await ws_manager.send_personal_message({
            "type": "connected",
            "user_id": user_id
        }, websocket)
        
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60)
                message = json.loads(data)
                
                if message.get("type") == "ping":
                    await ws_manager.send_personal_message({"type": "pong"}, websocket)
                
            except asyncio.TimeoutError:
                try:
                    await ws_manager.send_personal_message({"type": "ping"}, websocket)
                except:
                    break
                    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        ws_manager.disconnect(websocket, user_id)

async def broadcast_order_update(order: dict, event_type: str):
    """Broadcast order update to owner and customer with full order details"""
    pulperia = await db.pulperias.find_one({"pulperia_id": order.get("pulperia_id")}, {"_id": 0})
    owner_id = pulperia.get("owner_user_id") if pulperia else None
    customer_id = order.get("customer_user_id")
    pulperia_name = pulperia.get("name", "Pulpería") if pulperia else "Pulpería"
    customer_name = order.get("customer_name", "Cliente")
    
    # Enrich order with pulperia name
    enriched_order = {**order, "pulperia_name": pulperia_name}
    
    # Calculate total items
    items = order.get("items", [])
    total_items = sum(item.get("quantity", 1) for item in items)
    
    # Create item summary for messages
    item_summary = ", ".join([f"{item.get('quantity', 1)}x {item.get('product_name', 'Producto')}" for item in items[:3]])
    if len(items) > 3:
        item_summary += f" +{len(items) - 3} más"
    
    status_messages = {
        "pending": f"Tu orden en {pulperia_name} está pendiente",
        "accepted": f"¡{pulperia_name} aceptó tu orden! Están preparándola",
        "ready": f"🎉 ¡Tu orden en {pulperia_name} está lista para recoger!",
        "completed": f"Orden completada en {pulperia_name}",
        "cancelled": f"Tu orden en {pulperia_name} fue cancelada"
    }
    
    if owner_id:
        owner_notification = {
            "type": "order_update",
            "event": event_type,
            "target": "owner",
            "order": enriched_order,
            "message": f"Nuevo pedido de {customer_name}: {item_summary}" if event_type == "new_order" else f"Orden de {customer_name} actualizada",
            "total_items": total_items,
            "sound": event_type == "new_order",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await ws_manager.broadcast_to_user(owner_id, owner_notification)
    
    if customer_id:
        customer_notification = {
            "type": "order_update",
            "event": event_type,
            "target": "customer",
            "order": enriched_order,
            "message": status_messages.get(order.get("status"), "Estado de orden actualizado"),
            "total_items": total_items,
            "sound": order.get("status") == "ready",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await ws_manager.broadcast_to_user(customer_id, customer_notification)

# ============================================
# IMAGE UPLOAD ENDPOINT
# ============================================

@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Upload an image and return its base64 data URL"""
    user = await get_current_user(authorization, session_token)
    
    # Validate file type
    allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de archivo no permitido. Use JPEG, PNG, GIF o WebP.")
    
    # Read file content
    content = await file.read()
    
    # Check file size (max 5MB)
    max_size = 5 * 1024 * 1024  # 5MB
    if len(content) > max_size:
        raise HTTPException(status_code=400, detail="Archivo demasiado grande. Máximo 5MB.")
    
    # Convert to base64 data URL
    base64_content = base64.b64encode(content).decode('utf-8')
    data_url = f"data:{file.content_type};base64,{base64_content}"
    
    return {"image_url": data_url, "filename": file.filename, "size": len(content)}

@api_router.delete("/admin/clear-orders")
async def admin_clear_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Clear all orders from the system"""
    await get_admin_user(authorization, session_token)
    
    result = await db.orders.delete_many({})
    return {"message": f"Se eliminaron {result.deleted_count} órdenes del sistema"}

@api_router.delete("/admin/clear-data")
async def admin_clear_data(keep_products: bool = True, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Admin: Clear data from the system"""
    await get_admin_user(authorization, session_token)
    
    deleted = {}
    
    # Clear orders
    result = await db.orders.delete_many({})
    deleted["orders"] = result.deleted_count
    
    # Clear announcements
    result = await db.announcements.delete_many({})
    deleted["announcements"] = result.deleted_count
    
    # Clear reviews (optional)
    # result = await db.reviews.delete_many({})
    # deleted["reviews"] = result.deleted_count
    
    if not keep_products:
        result = await db.products.delete_many({})
        deleted["products"] = result.deleted_count
    
    return {"message": "Datos limpiados", "deleted": deleted}

# ============================================
# CORS MIDDLEWARE
# ============================================

# Dominios permitidos para CORS
ALLOWED_ORIGINS = [
    "https://lapulperia-web.preview.emergentagent.com",
    "https://lapulperiastore.net",
    "https://www.lapulperiastore.net",
    "https://red-auth-connect.emergent.host",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "*"  # Allow all for deployment flexibility
]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint - MUST be at root level for deployment
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes/deployment"""
    return {"status": "healthy", "service": "lapulperia-backend"}

# Also add health check under /api for nginx routing
@api_router.get("/health")
async def api_health_check():
    """Health check endpoint under /api prefix"""
    return {"status": "healthy", "service": "lapulperia-backend"}

app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
