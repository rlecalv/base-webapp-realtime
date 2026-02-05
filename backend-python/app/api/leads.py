"""
Routes API pour la capture de leads.
"""

from datetime import datetime
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.models.schemas import LeadRequest

router = APIRouter(prefix="/leads", tags=["Leads"])

# Stockage temporaire en mémoire (à remplacer par PostgreSQL)
_leads_store: dict = {}


@router.post("")
async def capturer_lead(request: LeadRequest):
    """
    Capture un lead (email requis pour télécharger le PDF).
    """
    lead_id = str(uuid4())

    lead = {
        "id": lead_id,
        "email": request.email,
        "telephone": request.telephone,
        "nom": request.nom,
        "estimation_id": request.estimation_id,
        "source": request.source,
        "created_at": datetime.now().isoformat(),
        "statut": "nouveau",
    }

    _leads_store[lead_id] = lead

    return {"success": True, "data": {"id": lead_id}}


@router.get("")
async def lister_leads(page: int = 1, limit: int = 50, statut: str | None = None):
    """
    Liste les leads capturés (endpoint admin).
    """
    leads = list(_leads_store.values())

    if statut:
        leads = [l for l in leads if l.get("statut") == statut]

    # Pagination simple
    start = (page - 1) * limit
    end = start + limit
    paginated = leads[start:end]

    return {
        "success": True,
        "data": paginated,
        "total": len(leads),
        "page": page,
        "limit": limit,
    }
