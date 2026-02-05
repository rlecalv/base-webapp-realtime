"""
Application FastAPI principale pour MonEstimation.

API d'estimation immobilière connectée au warehouse Horizon.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import estimation, leads, pdf
from app.config import close_db_pool, get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application."""
    # Startup
    yield
    # Shutdown
    await close_db_pool()


settings = get_settings()

app = FastAPI(
    title=settings.api_title,
    version=settings.api_version,
    description="API d'estimation immobilière pour vendremonimmeuble.fr et estimermonimmeuble.fr",
    lifespan=lifespan,
)

# CORS
origins = settings.cors_origins.split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Routes
app.include_router(estimation.router, prefix="/api/v1")
app.include_router(leads.router, prefix="/api/v1")
app.include_router(pdf.router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Vérification de l'état du service."""
    return {"status": "healthy", "version": settings.api_version}


@app.get("/")
async def root():
    """Page d'accueil de l'API."""
    return {
        "name": settings.api_title,
        "version": settings.api_version,
        "docs": "/docs",
        "health": "/health",
    }
