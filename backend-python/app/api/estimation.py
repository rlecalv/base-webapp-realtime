"""
Routes API pour les estimations immobilières.
"""

from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    ApiResponse,
    ComparablesSearchParams,
    EstimationRequest,
    EstimationResponse,
)
from app.services.dvf_service import rechercher_comparables
from app.services.estimation_engine import calculer_estimation

router = APIRouter(prefix="/estimations", tags=["Estimations"])


@router.post("", response_model=EstimationResponse)
async def creer_estimation(request: EstimationRequest) -> EstimationResponse:
    """
    Crée une nouvelle estimation immobilière.

    L'algorithme combine :
    - Méthode comparative DVF (transactions réelles PostGIS)
    - Méthode capitalisation (si loyers fournis)
    - Ajustements hédoniques (DPE, ancienneté)
    - Décotes cumulables (bloc, occupation, DPE, bail, état)
    """
    try:
        estimation = await calculer_estimation(request)
        return estimation
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Erreur lors du calcul de l'estimation: {str(e)}"
        )


@router.get("/{estimation_id}", response_model=ApiResponse)
async def get_estimation(estimation_id: str) -> ApiResponse:
    """
    Récupère une estimation par son ID.

    Note: Les estimations sont stateless pour l'instant.
    Implémentation future avec stockage Redis ou PostgreSQL.
    """
    # TODO: Implémenter le stockage persistant des estimations
    raise HTTPException(
        status_code=501,
        detail="Récupération d'estimation non implémentée. Les estimations sont calculées à la demande.",
    )


@router.get("/comparables/search")
async def rechercher_comparables_endpoint(
    latitude: float,
    longitude: float,
    rayon_m: int = 1000,
    type_local: str | None = None,
    surface_min: float | None = None,
    surface_max: float | None = None,
):
    """
    Recherche les transactions comparables DVF dans un rayon géographique.
    """
    try:
        type_local_list = [type_local] if type_local else None
        comparables = await rechercher_comparables(
            latitude=latitude,
            longitude=longitude,
            rayon_metres=rayon_m,
            type_local=type_local_list,
            surface_min=surface_min,
            surface_max=surface_max,
        )
        return {"success": True, "data": comparables, "count": len(comparables)}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la recherche de comparables: {str(e)}",
        )
