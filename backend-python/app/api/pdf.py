"""
Routes API pour la génération de rapports PDF.

Note: Implémentation basique. Pour production, utiliser Puppeteer + Handlebars
via un service Node.js dédié ou WeasyPrint.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

router = APIRouter(prefix="/export", tags=["Export"])


@router.post("/pdf")
async def generer_pdf(estimation_id: str, email: str):
    """
    Génère un rapport PDF pour une estimation.

    Requiert un email pour la capture de lead.
    """
    # TODO: Implémenter génération PDF avec Puppeteer/Handlebars
    # Pour l'instant, retourne un placeholder

    return JSONResponse(
        status_code=501,
        content={
            "success": False,
            "error": "Génération PDF en cours d'implémentation",
            "message": "Le rapport sera envoyé par email une fois disponible",
        },
    )
