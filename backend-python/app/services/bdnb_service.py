"""
Service d'enrichissement BDNB (DPE, année construction, risques).
"""

from dataclasses import dataclass
from typing import Optional

from app.config import get_db_pool


@dataclass
class BdnbData:
    """Données BDNB d'un bâtiment."""

    annee_construction: Optional[int] = None
    classe_dpe: Optional[str] = None
    classe_ges: Optional[str] = None
    conso_energie: Optional[float] = None
    alea_argile: Optional[str] = None
    monument_historique: bool = False


async def get_batiment_proche(
    latitude: float,
    longitude: float,
    rayon_m: int = 50,
) -> Optional[BdnbData]:
    """
    Récupère les données BDNB du bâtiment le plus proche.

    Utilise la table bdnb_batiment_groupe avec jointure DPE.
    """
    pool = await get_db_pool()

    query = """
        SELECT 
            bg.annee_construction,
            dpe.classe_bilan_dpe,
            dpe.classe_emission_ges,
            dpe.ep_conso_5_usages_m2,
            bg.alea_argile,
            bg.distance_batiment_historique_le_plus_proche
        FROM bdnb_batiment_groupe bg
        LEFT JOIN bdnb_batiment_groupe_dpe_representatif_logement dpe 
            ON bg.batiment_groupe_id = dpe.batiment_groupe_id
        WHERE bg.geom_groupe IS NOT NULL
          AND ST_DWithin(
                bg.geom_groupe::geography,
                ST_MakePoint($1, $2)::geography,
                $3
          )
        ORDER BY ST_Distance(
            bg.geom_groupe::geography,
            ST_MakePoint($1, $2)::geography
        )
        LIMIT 1
    """

    try:
        async with pool.acquire() as conn:
            row = await conn.fetchrow(query, longitude, latitude, rayon_m)

        if not row:
            return None

        return BdnbData(
            annee_construction=row["annee_construction"],
            classe_dpe=row["classe_bilan_dpe"],
            classe_ges=row["classe_emission_ges"],
            conso_energie=(
                float(row["ep_conso_5_usages_m2"])
                if row["ep_conso_5_usages_m2"]
                else None
            ),
            alea_argile=row["alea_argile"],
            monument_historique=(
                row["distance_batiment_historique_le_plus_proche"] is not None
                and row["distance_batiment_historique_le_plus_proche"] < 100
            ),
        )
    except Exception:
        # Table BDNB peut ne pas exister ou être vide
        return None
