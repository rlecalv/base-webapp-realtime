"""
Configuration du backend FastAPI pour MonEstimation.
Connexion au warehouse Horizon (PostgreSQL + PostGIS).
"""

from functools import lru_cache
from typing import Optional

import asyncpg
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuration de l'application."""

    # API
    api_title: str = "MonEstimation API"
    api_version: str = "1.0.0"
    debug: bool = False

    # Warehouse Horizon (PostgreSQL + PostGIS)
    warehouse_host: str = "localhost"
    warehouse_port: int = 5432
    warehouse_db: str = "horizon_warehouse"
    warehouse_user: str = "postgres"
    warehouse_password: str = "postgres"

    # Redis (cache)
    redis_url: str = "redis://localhost:6379/0"

    # CORS
    cors_origins: str = "http://localhost:3000"

    # Géocodage IGN
    ign_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_prefix = "ESTIMATION_"


@lru_cache
def get_settings() -> Settings:
    """Retourne les settings avec cache."""
    return Settings()


# Pool de connexions asyncpg
_pool: Optional[asyncpg.Pool] = None


async def get_db_pool() -> asyncpg.Pool:
    """Retourne le pool de connexions au warehouse."""
    global _pool
    if _pool is None:
        settings = get_settings()
        _pool = await asyncpg.create_pool(
            host=settings.warehouse_host,
            port=settings.warehouse_port,
            database=settings.warehouse_db,
            user=settings.warehouse_user,
            password=settings.warehouse_password,
            min_size=2,
            max_size=10,
        )
    return _pool


async def close_db_pool() -> None:
    """Ferme le pool de connexions."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
