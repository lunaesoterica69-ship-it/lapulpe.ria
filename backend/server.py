from fastapi import FastAPI, APIRouter, HTTPException, Cookie, Response, Header, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
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
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    picture: Optional[str] = None
    user_type: Optional[Literal["cliente", "pulperia"]] = None
    location: Optional[dict] = None
    created_at: datetime

class UserSession(BaseModel):
    user_id: str
    session_token: str
    expires_at: datetime
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
    # Customization options
    title_font: Optional[str] = "default"  # default, serif, script, bold
    background_color: Optional[str] = "#DC2626"  # Default red
    created_at: datetime

class Product(BaseModel):
    product_id: str
    pulperia_id: str
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0  # Keep for backwards compatibility
    available: bool = True  # New availability toggle
    category: Optional[str] = None
    image_url: Optional[str] = None
    created_at: datetime

class OrderItem(BaseModel):
    product_id: str
    product_name: str
    quantity: int
    price: float
    image_url: Optional[str] = None

class Order(BaseModel):
    order_id: str
    customer_user_id: str
    pulperia_id: str
    items: List[OrderItem]
    total: float
    status: Literal["pending", "accepted", "ready", "completed", "cancelled"] = "pending"
    order_type: Literal["online", "pickup"] = "pickup"
    created_at: datetime

class Message(BaseModel):
    message_id: str
    from_user_id: str
    to_user_id: str
    order_id: Optional[str] = None
    message: str
    created_at: datetime

class Review(BaseModel):
    review_id: str
    pulperia_id: str
    user_id: str
    user_name: str
    rating: int
    comment: Optional[str] = None
    images: List[str] = []  # Up to 2 images
    created_at: datetime

class Job(BaseModel):
    job_id: str
    employer_user_id: str
    employer_name: str
    pulperia_id: Optional[str] = None  # If posted by a pulperia
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

class JobApplication(BaseModel):
    application_id: str
    job_id: str
    applicant_user_id: str
    applicant_name: str
    contact: str
    cv_url: Optional[str] = None
    message: Optional[str] = None
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
    plan: Literal["basico", "destacado", "premium"]
    status: Literal["pending", "active", "expired"] = "pending"
    payment_method: str
    payment_reference: Optional[str] = None
    amount: float
    duration_days: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    created_at: datetime

class AdvertisementCreate(BaseModel):
    plan: Literal["basico", "destacado", "premium"]
    payment_method: str
    payment_reference: Optional[str] = None

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
    title_font: Optional[str] = "default"
    background_color: Optional[str] = "#DC2626"

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
    images: List[str] = []  # Up to 2 images

class JobApplicationCreate(BaseModel):
    contact: str
    cv_url: Optional[str] = None
    message: Optional[str] = None

class OrderCreate(BaseModel):
    pulperia_id: str
    items: List[OrderItem]
    total: float
    order_type: Literal["online", "pickup"] = "pickup"

class MessageCreate(BaseModel):
    to_user_id: str
    order_id: Optional[str] = None
    message: str

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
    pulperia_id: Optional[str] = None  # Optional: link job to pulperia

class ServiceCreate(BaseModel):
    title: str
    description: str
    category: str
    hourly_rate: float
    rate_currency: Literal["HNL", "USD"]
    location: str
    contact: str
    images: List[str] = []

async def get_current_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    token = None
    
    if session_token:
        token = session_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session_doc = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session_doc:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session_doc["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user_doc = await db.users.find_one({"user_id": session_doc["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    
    return User(**user_doc)

@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    async with httpx.AsyncClient() as http_client:
        try:
            emergent_response = await http_client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": request.session_id},
                timeout=10
            )
            emergent_response.raise_for_status()
            auth_data = emergent_response.json()
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Auth service error: {str(e)}")
    
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    session_token = auth_data["session_token"]
    
    existing_user = await db.users.find_one({"email": auth_data["email"]}, {"_id": 0})
    
    if existing_user:
        user_id = existing_user["user_id"]
        await db.users.update_one(
            {"user_id": user_id},
            {"$set": {
                "name": auth_data["name"],
                "picture": auth_data["picture"]
            }}
        )
        is_new_user = False
    else:
        user_doc = {
            "user_id": user_id,
            "email": auth_data["email"],
            "name": auth_data["name"],
            "picture": auth_data["picture"],
            "user_type": None,  # New users must select their type
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
    user["is_new_user"] = is_new_user if 'is_new_user' in dir() else False
    return user

@api_router.get("/auth/me")
async def get_me(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    return user

@api_router.post("/auth/logout")
async def logout(response: Response, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    token = session_token or (authorization.replace("Bearer ", "") if authorization else None)
    
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.post("/auth/set-user-type")
async def set_user_type(user_type: Literal["cliente", "pulperia"], authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"user_type": user_type}}
    )
    
    updated_user = await db.users.find_one({"user_id": user.user_id}, {"_id": 0})
    return updated_user

@api_router.get("/pulperias")
async def get_pulperias(lat: Optional[float] = None, lng: Optional[float] = None, search: Optional[str] = None, sort_by: Optional[str] = None):
    query = {}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}}
        ]
    
    sort_options = {}
    if sort_by == "rating":
        sort_options = [("rating", -1)]
    
    pulperias = await db.pulperias.find(query, {"_id": 0}).sort(sort_options if sort_options else [("created_at", -1)]).to_list(100)
    
    return pulperias

@api_router.get("/pulperias/{pulperia_id}")
async def get_pulperia(pulperia_id: str):
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    return pulperia

@api_router.post("/pulperias")
async def create_pulperia(pulperia_data: PulperiaCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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

@api_router.get("/pulperias/{pulperia_id}/reviews")
async def get_pulperia_reviews(pulperia_id: str):
    reviews = await db.reviews.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return reviews

@api_router.post("/pulperias/{pulperia_id}/reviews")
async def create_review(pulperia_id: str, review_data: ReviewCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    if user.user_type != "cliente":
        raise HTTPException(status_code=403, detail="Solo clientes pueden dejar reviews")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    # Check if user already reviewed (1 review per person)
    existing_review = await db.reviews.find_one({"pulperia_id": pulperia_id, "user_id": user.user_id}, {"_id": 0})
    if existing_review:
        raise HTTPException(status_code=400, detail="Ya has dejado una review para esta pulpería")
    
    if review_data.rating < 1 or review_data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating debe estar entre 1 y 5")
    
    # Limit images to 2
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
    
    # Update pulperia rating
    all_reviews = await db.reviews.find({"pulperia_id": pulperia_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in all_reviews) / len(all_reviews)
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": {"rating": round(avg_rating, 1), "review_count": len(all_reviews)}}
    )
    
    return await db.reviews.find_one({"review_id": review_id}, {"_id": 0})

    return await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})

@api_router.put("/pulperias/{pulperia_id}")
async def update_pulperia(pulperia_id: str, pulperia_data: PulperiaCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    pulperia = await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="Pulpería no encontrada")
    
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar esta pulpería")
    
    await db.pulperias.update_one(
        {"pulperia_id": pulperia_id},
        {"$set": pulperia_data.model_dump()}
    )
    
    return await db.pulperias.find_one({"pulperia_id": pulperia_id}, {"_id": 0})

@api_router.get("/pulperias/{pulperia_id}/products")
async def get_pulperia_products(pulperia_id: str):
    products = await db.products.find({"pulperia_id": pulperia_id}, {"_id": 0}).to_list(100)
    return products

@api_router.get("/products")
async def search_products(search: Optional[str] = None, category: Optional[str] = None, sort_by: Optional[str] = None):
    query = {}
    if search:
        query["name"] = {"$regex": search, "$options": "i"}
    if category:
        query["category"] = category
    
    sort_options = [("created_at", -1)]
    if sort_by == "price_asc":
        sort_options = [("price", 1)]
    elif sort_by == "price_desc":
        sort_options = [("price", -1)]
    
    products = await db.products.find(query, {"_id": 0}).sort(sort_options).to_list(100)
    
    # Optimize: Batch fetch pulperia info to avoid N+1 queries
    pulperia_ids = list(set(p["pulperia_id"] for p in products))
    if pulperia_ids:
        pulperias_list = await db.pulperias.find(
            {"pulperia_id": {"$in": pulperia_ids}},
            {"_id": 0, "pulperia_id": 1, "name": 1, "logo_url": 1}
        ).to_list(len(pulperia_ids))
        pulperias_dict = {p["pulperia_id"]: p for p in pulperias_list}
        
        # Enrich products with pulperia info
        for product in products:
            pulperia = pulperias_dict.get(product["pulperia_id"])
            if pulperia:
                product["pulperia_name"] = pulperia["name"]
                product["pulperia_logo"] = pulperia.get("logo_url")
    
    return products

@api_router.get("/products/{product_id}")
async def get_product(product_id: str):
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return product

@api_router.post("/products")
async def create_product(product_data: ProductCreate, pulperia_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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
    user = await get_current_user(authorization, session_token)
    
    product = await db.products.find_one({"product_id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    pulperia = await db.pulperias.find_one({"pulperia_id": product["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para editar este producto")
    
    # Toggle availability
    new_available = not product.get("available", True)
    
    await db.products.update_one(
        {"product_id": product_id},
        {"$set": {"available": new_available}}
    )
    
    return await db.products.find_one({"product_id": product_id}, {"_id": 0})

@api_router.get("/orders")
async def get_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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
    user = await get_current_user(authorization, session_token)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "customer_user_id": user.user_id,
        **order_data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Get fresh order and broadcast to owner via WebSocket
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    await broadcast_order_update(order, "new_order")
    
    return order

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status_update: OrderStatusUpdate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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
    
    # Get updated order and broadcast via WebSocket
    updated_order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    
    # Broadcast update to owner and customer
    event_type = "cancelled" if status_update.status == "cancelled" else "status_changed"
    await broadcast_order_update(updated_order, event_type)
    
    return updated_order

@api_router.get("/jobs")
async def get_jobs(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    jobs = await db.jobs.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.post("/jobs")
async def create_job(job_data: JobCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    # Check if job is linked to a pulperia
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

@api_router.get("/pulperias/{pulperia_id}/jobs")
async def get_pulperia_jobs(pulperia_id: str):
    """Get all jobs posted by a specific pulperia"""
    jobs = await db.jobs.find({"pulperia_id": pulperia_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return jobs

@api_router.delete("/jobs/{job_id}")
async def delete_job(job_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Empleo no encontrado")
    
    if job["employer_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este empleo")
    
    await db.jobs.delete_one({"job_id": job_id})
    # Also delete all applications for this job
    await db.job_applications.delete_many({"job_id": job_id})
    return {"message": "Empleo eliminado"}

@api_router.post("/jobs/{job_id}/apply")
async def apply_to_job(job_id: str, application_data: JobApplicationCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Empleo no encontrado")
    
    # Check if already applied
    existing = await db.job_applications.find_one({"job_id": job_id, "applicant_user_id": user.user_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Ya aplicaste a este empleo")
    
    application_id = f"app_{uuid.uuid4().hex[:12]}"
    application_doc = {
        "application_id": application_id,
        "job_id": job_id,
        "applicant_user_id": user.user_id,
        "applicant_name": user.name,
        **application_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.job_applications.insert_one(application_doc)
    return await db.job_applications.find_one({"application_id": application_id}, {"_id": 0})

@api_router.get("/jobs/{job_id}/applications")
async def get_job_applications(job_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    job = await db.jobs.find_one({"job_id": job_id}, {"_id": 0})
    if not job:
        raise HTTPException(status_code=404, detail="Empleo no encontrado")
    
    # Only job owner can see applications
    if job["employer_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver las aplicaciones")
    
    applications = await db.job_applications.find({"job_id": job_id}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return applications

@api_router.get("/services")
async def get_services(category: Optional[str] = None, search: Optional[str] = None):
    query = {}
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    services = await db.services.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return services

@api_router.post("/services")
async def create_service(service_data: ServiceCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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
    user = await get_current_user(authorization, session_token)
    
    service = await db.services.find_one({"service_id": service_id}, {"_id": 0})
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
    
    if service["provider_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para eliminar este servicio")
    
    await db.services.delete_one({"service_id": service_id})
    return {"message": "Servicio eliminado"}

@api_router.get("/orders/completed")
async def get_completed_orders(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
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
    user = await get_current_user(authorization, session_token)
    
    if user.user_type != "pulperia":
        raise HTTPException(status_code=403, detail="Solo pulperías pueden ver estadísticas")
    
    user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
    pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
    
    # Calculate date range
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
    
    # Top products
    product_counts = {}
    for order in orders:
        for item in order["items"]:
            product_name = item["product_name"]
            if product_name in product_counts:
                product_counts[product_name] += item["quantity"]
            else:
                product_counts[product_name] = item["quantity"]
    
    top_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "period": period,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "average_order": total_revenue / total_orders if total_orders > 0 else 0,
        "top_products": [{"name": name, "quantity": qty} for name, qty in top_products],
        "orders": orders
    }

# Notifications endpoint for the profile dropdown
@api_router.get("/notifications")
async def get_notifications(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    notifications = []
    
    if user.user_type == "pulperia":
        # Get pending orders for pulperia owners
        user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
        pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
        
        pending_orders = await db.orders.find(
            {"pulperia_id": {"$in": pulperia_ids}, "status": {"$in": ["pending", "accepted"]}},
            {"_id": 0}
        ).sort("created_at", -1).to_list(10)
        
        for order in pending_orders:
            notifications.append({
                "id": order["order_id"],
                "type": "order",
                "title": f"Orden #{order['order_id'][-6:]}",
                "message": f"{len(order['items'])} productos - L{order['total']:.2f}",
                "status": order["status"],
                "created_at": order["created_at"]
            })
    else:
        # Get order updates for customers
        customer_orders = await db.orders.find(
            {"customer_user_id": user.user_id, "status": {"$ne": "completed"}},
            {"_id": 0}
        ).sort("created_at", -1).to_list(10)
        
        for order in customer_orders:
            status_messages = {
                "pending": "Esperando confirmación",
                "accepted": "¡Orden aceptada!",
                "ready": "¡Tu orden está lista!",
                "cancelled": "Orden cancelada"
            }
            notifications.append({
                "id": order["order_id"],
                "type": "order_status",
                "title": f"Orden #{order['order_id'][-6:]}",
                "message": status_messages.get(order["status"], order["status"]),
                "status": order["status"],
                "created_at": order["created_at"]
            })
    
    return notifications

@api_router.get("/messages")
async def get_messages(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    messages = await db.messages.find(
        {"$or": [{"from_user_id": user.user_id}, {"to_user_id": user.user_id}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return messages

@api_router.post("/messages")
async def create_message(message_data: MessageCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    user = await get_current_user(authorization, session_token)
    
    message_id = f"message_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "from_user_id": user.user_id,
        **message_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    return await db.messages.find_one({"message_id": message_id}, {"_id": 0})

# Advertisement pricing plans
AD_PLANS = {
    "basico": {"price": 50, "duration": 7, "name": "Básico", "features": ["Aparece en lista destacada"]},
    "destacado": {"price": 100, "duration": 15, "name": "Destacado", "features": ["Aparece primero en búsquedas", "Badge destacado"]},
    "premium": {"price": 200, "duration": 30, "name": "Premium", "features": ["Aparece primero", "Badge premium", "Banner en inicio"]}
}

@api_router.get("/ads/plans")
async def get_ad_plans():
    """Get available advertising plans"""
    return AD_PLANS

@api_router.get("/ads/featured")
async def get_featured_pulperias():
    """Get featured/advertised pulperias"""
    now = datetime.now(timezone.utc)
    
    # Get active ads
    active_ads = await db.advertisements.find(
        {"status": "active", "end_date": {"$gte": now.isoformat()}},
        {"_id": 0}
    ).sort([("plan", -1), ("created_at", -1)]).to_list(20)
    
    # Get pulperia details for each ad
    featured = []
    for ad in active_ads:
        pulperia = await db.pulperias.find_one({"pulperia_id": ad["pulperia_id"]}, {"_id": 0})
        if pulperia:
            pulperia["ad_plan"] = ad["plan"]
            featured.append(pulperia)
    
    return featured

@api_router.get("/ads/my-ads")
async def get_my_ads(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Get ads for current user's pulperias"""
    user = await get_current_user(authorization, session_token)
    
    # Get user's pulperias
    user_pulperias = await db.pulperias.find({"owner_user_id": user.user_id}, {"_id": 0}).to_list(100)
    pulperia_ids = [p["pulperia_id"] for p in user_pulperias]
    
    # Get ads for those pulperias
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
    
    # Get user's pulperia
    pulperia = await db.pulperias.find_one({"owner_user_id": user.user_id}, {"_id": 0})
    if not pulperia:
        raise HTTPException(status_code=404, detail="No tienes una pulpería registrada")
    
    # Check if already has active ad
    existing_ad = await db.advertisements.find_one({
        "pulperia_id": pulperia["pulperia_id"],
        "status": {"$in": ["pending", "active"]}
    }, {"_id": 0})
    
    if existing_ad:
        raise HTTPException(status_code=400, detail="Ya tienes un anuncio activo o pendiente")
    
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
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.advertisements.insert_one(ad_doc)
    
    return await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})

@api_router.put("/ads/{ad_id}/activate")
async def activate_advertisement(ad_id: str, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Activate an advertisement (admin function - for now any pulperia owner can activate their own)"""
    user = await get_current_user(authorization, session_token)
    
    ad = await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})
    if not ad:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    # Verify ownership
    pulperia = await db.pulperias.find_one({"pulperia_id": ad["pulperia_id"]}, {"_id": 0})
    if pulperia["owner_user_id"] != user.user_id:
        raise HTTPException(status_code=403, detail="No tienes permiso")
    
    # Calculate dates
    now = datetime.now(timezone.utc)
    end_date = now + timedelta(days=ad["duration_days"])
    
    await db.advertisements.update_one(
        {"ad_id": ad_id},
        {"$set": {
            "status": "active",
            "start_date": now.isoformat(),
            "end_date": end_date.isoformat()
        }}
    )
    
    return await db.advertisements.find_one({"ad_id": ad_id}, {"_id": 0})

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ============================================
# WEBSOCKET CONNECTION MANAGER FOR REAL-TIME
# ============================================

class ConnectionManager:
    """Manages WebSocket connections for real-time order updates"""
    
    def __init__(self):
        # Maps user_id to set of active WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Track connection count per user
        self.connection_count: Dict[str, int] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept and track a new WebSocket connection"""
        await websocket.accept()
        
        if user_id not in self.active_connections:
            self.active_connections[user_id] = set()
            self.connection_count[user_id] = 0
        
        self.active_connections[user_id].add(websocket)
        self.connection_count[user_id] += 1
        
        logger.info(f"✅ WebSocket connected for user {user_id}. Total connections: {self.connection_count[user_id]}")
    
    def disconnect(self, websocket: WebSocket, user_id: str):
        """Remove a WebSocket connection"""
        if user_id in self.active_connections:
            self.active_connections[user_id].discard(websocket)
            self.connection_count[user_id] = max(0, self.connection_count.get(user_id, 1) - 1)
            
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                del self.connection_count[user_id]
            
            logger.info(f"❌ WebSocket disconnected for user {user_id}. Remaining: {self.connection_count.get(user_id, 0)}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to a specific connection"""
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
    
    async def broadcast_to_user(self, user_id: str, message: dict):
        """Broadcast message to all connections of a specific user"""
        if user_id not in self.active_connections:
            return
        
        disconnected = set()
        for connection in self.active_connections[user_id].copy():
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to user {user_id}: {e}")
                disconnected.add(connection)
        
        # Clean up broken connections
        for conn in disconnected:
            self.active_connections[user_id].discard(conn)
    
    async def broadcast_to_users(self, user_ids: List[str], message: dict):
        """Broadcast to multiple users (owner and customer)"""
        for user_id in user_ids:
            if user_id:
                await self.broadcast_to_user(user_id, message)
    
    def is_user_connected(self, user_id: str) -> bool:
        """Check if a user has any active connections"""
        return user_id in self.active_connections and len(self.active_connections[user_id]) > 0

# Global connection manager
ws_manager = ConnectionManager()

# ============================================
# WEBSOCKET ENDPOINT
# ============================================

@app.websocket("/ws/orders/{user_id}")
async def websocket_orders_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time order updates.
    Clients connect with their user_id to receive instant notifications.
    """
    # Validate user_id by checking if session token is valid
    token = websocket.query_params.get("token")
    
    # For now, we accept connections if they have a valid user_id format
    # In production, validate against session tokens
    if not user_id or len(user_id) < 5:
        await websocket.close(code=4001, reason="Invalid user_id")
        return
    
    await ws_manager.connect(websocket, user_id)
    
    try:
        # Send initial connection success message
        await ws_manager.send_personal_message({
            "type": "connected",
            "message": "Conexión establecida. Recibirás actualizaciones en tiempo real.",
            "user_id": user_id
        }, websocket)
        
        # Keep connection alive and handle incoming messages
        while True:
            try:
                data = await asyncio.wait_for(websocket.receive_text(), timeout=60)
                message = json.loads(data)
                
                # Handle ping/pong for keep-alive
                if message.get("type") == "ping":
                    await ws_manager.send_personal_message({"type": "pong"}, websocket)
                
                # Handle order status update request via WebSocket
                elif message.get("type") == "update_order_status":
                    order_id = message.get("order_id")
                    new_status = message.get("status")
                    
                    if order_id and new_status:
                        # Update in database
                        result = await db.orders.update_one(
                            {"order_id": order_id},
                            {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
                        )
                        
                        if result.modified_count > 0:
                            # Get order details for notification
                            order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
                            if order:
                                # Broadcast update to all relevant users
                                await broadcast_order_update(order, "status_changed")
                
            except asyncio.TimeoutError:
                # Send ping to keep connection alive
                try:
                    await ws_manager.send_personal_message({"type": "ping"}, websocket)
                except:
                    break
                    
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        ws_manager.disconnect(websocket, user_id)

# ============================================
# BROADCAST HELPER FUNCTIONS
# ============================================

async def broadcast_order_update(order: dict, event_type: str):
    """
    Broadcast order update to owner and customer
    event_type: 'new_order', 'status_changed', 'cancelled'
    """
    # Get pulperia owner
    pulperia = await db.pulperias.find_one({"pulperia_id": order.get("pulperia_id")}, {"_id": 0})
    owner_id = pulperia.get("owner_user_id") if pulperia else None
    customer_id = order.get("customer_user_id")
    
    # Send FULL order data for real-time updates (like Papas Pizzeria style)
    full_order_data = {
        "order_id": order.get("order_id"),
        "customer_user_id": order.get("customer_user_id"),
        "pulperia_id": order.get("pulperia_id"),
        "items": order.get("items", []),
        "total": order.get("total", 0),
        "status": order.get("status"),
        "order_type": order.get("order_type", "pickup"),
        "created_at": order.get("created_at")
    }
    
    # Prepare notification message with FULL order data
    notification = {
        "type": "order_update",
        "event": event_type,
        "order": full_order_data,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    # Send to owner (pulperia) - they need full order details
    if owner_id:
        owner_notification = {
            **notification,
            "target": "owner",
            "message": get_owner_message(event_type, order),
            "sound": event_type == "new_order"  # Play sound for new orders
        }
        await ws_manager.broadcast_to_user(owner_id, owner_notification)
        logger.info(f"📤 Sent {event_type} notification to owner {owner_id}")
    
    # Send to customer - they need status updates
    if customer_id:
        customer_notification = {
            **notification,
            "target": "customer", 
            "message": get_customer_message(event_type, order),
            "sound": event_type in ["ready", "accepted"]  # Sound when order is ready
        }
        await ws_manager.broadcast_to_user(customer_id, customer_notification)
        logger.info(f"📤 Sent {event_type} notification to customer {customer_id}")

def get_owner_message(event_type: str, order: dict) -> str:
    """Generate message for pulperia owner"""
    order_id_short = order.get("order_id", "")[-6:]
    total = order.get("total", 0)
    
    messages = {
        "new_order": f"🔔 ¡Nueva orden #{order_id_short}! Total: L{total:.2f}",
        "status_changed": f"📦 Orden #{order_id_short} actualizada a: {order.get('status')}",
        "cancelled": f"❌ Orden #{order_id_short} cancelada"
    }
    return messages.get(event_type, f"Actualización de orden #{order_id_short}")

def get_customer_message(event_type: str, order: dict) -> str:
    """Generate message for customer"""
    order_id_short = order.get("order_id", "")[-6:]
    status = order.get("status", "")
    
    status_messages = {
        "pending": "⏳ Tu orden está pendiente de confirmación",
        "accepted": "✅ ¡Tu orden fue aceptada! La están preparando",
        "ready": "🎉 ¡Tu orden está lista para recoger!",
        "completed": "✔️ Orden completada. ¡Gracias!",
        "cancelled": "❌ Tu orden fue cancelada"
    }
    
    if event_type == "new_order":
        return f"📝 Orden #{order_id_short} creada exitosamente"
    
    return status_messages.get(status, f"Actualización de orden #{order_id_short}")

# ============================================
# MODIFIED ORDER ENDPOINTS WITH WEBSOCKET NOTIFICATIONS
# ============================================

# Override the original create_order to add WebSocket notification
@api_router.post("/orders/realtime")
async def create_order_realtime(order_data: OrderCreate, authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    """Create order with real-time notification to pulperia owner"""
    user = await get_current_user(authorization, session_token)
    
    order_id = f"order_{uuid.uuid4().hex[:12]}"
    order_doc = {
        "order_id": order_id,
        "customer_user_id": user.user_id,
        **order_data.model_dump(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.orders.insert_one(order_doc)
    
    # Get fresh order and broadcast to owner
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    await broadcast_order_update(order, "new_order")
    
    return order

# Add endpoint to get WebSocket status
@api_router.get("/ws/status/{user_id}")
async def get_ws_status(user_id: str):
    """Check if a user has active WebSocket connections"""
    return {
        "user_id": user_id,
        "connected": ws_manager.is_user_connected(user_id),
        "connection_count": ws_manager.connection_count.get(user_id, 0)
    }

# Include the API router AFTER all endpoints are defined
app.include_router(api_router)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()