"""
Service d'accès aux données DVF via PostGIS.
Requêtes géographiques optimisées sur le warehouse Horizon.
"""

from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import Optional

import asyncpg

from app.config import get_db_pool
from app.models.schemas import Comparable


async def rechercher_comparables(
    latitude: float,
    longitude: float,
    rayon_metres: int = 1000,
    type_local: Optional[list[str]] = None,
    date_min: Optional[date] = None,
    surface_min: Optional[float] = None,
    surface_max: Optional[float] = None,
    exclure_ventes_bloc: bool = True,
    limit: int = 50,
) -> list[Comparable]:
    """
    Recherche les transactions DVF dans un rayon géographique.

    Utilise PostGIS ST_DWithin pour des performances optimales.
    """
    pool = await get_db_pool()

    # Date par défaut : 3 dernières années
    if date_min is None:
        date_min = datetime.now().date() - timedelta(days=3 * 365)

    # Construction de la requête SQL avec PostGIS
    query = """
        SELECT 
            id,
            COALESCE(adresse_complete, 
                     CONCAT(adresse_numero, ' ', adresse_nom_voie, ', ', commune)) as adresse,
            date_mutation,
            valeur_fonciere,
            COALESCE(surface_carrez, surface_reelle_bati) as surface,
            prix_m2_bati as prix_m2,
            type_local,
            ST_Distance(
                coordonnees::geography,
                ST_MakePoint($1, $2)::geography
            ) as distance_m,
            annee_construction
        FROM valorisation_transactiondvf
        WHERE coordonnees IS NOT NULL
          AND ST_DWithin(
                coordonnees::geography,
                ST_MakePoint($1, $2)::geography,
                $3
          )
          AND date_mutation >= $4
          AND prix_m2_bati IS NOT NULL
          AND prix_m2_bati > 0
    """

    params = [longitude, latitude, rayon_metres, date_min]
    param_idx = 5

    # Filtres additionnels
    if exclure_ventes_bloc:
        query += " AND est_vente_bloc = FALSE"

    if type_local:
        query += f" AND type_local = ANY(${param_idx})"
        params.append(type_local)
        param_idx += 1

    if surface_min:
        query += f" AND COALESCE(surface_carrez, surface_reelle_bati) >= ${param_idx}"
        params.append(surface_min)
        param_idx += 1

    if surface_max:
        query += f" AND COALESCE(surface_carrez, surface_reelle_bati) <= ${param_idx}"
        params.append(surface_max)
        param_idx += 1

    # Tri par distance puis qualité
    query += " ORDER BY distance_m ASC, score_qualite DESC"
    query += f" LIMIT ${param_idx}"
    params.append(limit)

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)

    comparables = []
    for row in rows:
        comparables.append(
            Comparable(
                id=row["id"],
                adresse=row["adresse"] or "Adresse non disponible",
                date_mutation=row["date_mutation"],
                valeur_fonciere=Decimal(str(row["valeur_fonciere"])),
                surface=float(row["surface"]) if row["surface"] else None,
                prix_m2=float(row["prix_m2"]) if row["prix_m2"] else None,
                type_local=row["type_local"],
                distance_m=round(row["distance_m"], 1) if row["distance_m"] else None,
                annee_construction=row["annee_construction"],
            )
        )

    return comparables


async def rechercher_avec_rayon_adaptatif(
    latitude: float,
    longitude: float,
    surface: float,
    type_local: Optional[str] = None,
    min_comparables: int = 10,
) -> tuple[list[Comparable], int]:
    """
    Recherche avec rayon adaptatif jusqu'à obtenir assez de comparables.

    Retourne les comparables et le rayon utilisé.
    """
    rayons = [500, 1000, 1500, 2000, 3000]
    type_local_list = [type_local] if type_local else None

    # Filtre par surface similaire (±50%)
    surface_min = surface * 0.5
    surface_max = surface * 1.5

    for rayon in rayons:
        comparables = await rechercher_comparables(
            latitude=latitude,
            longitude=longitude,
            rayon_metres=rayon,
            type_local=type_local_list,
            surface_min=surface_min,
            surface_max=surface_max,
        )
        if len(comparables) >= min_comparables:
            return comparables, rayon

    # Dernier essai sans filtre surface
    return await rechercher_comparables(
        latitude=latitude,
        longitude=longitude,
        rayon_metres=3000,
        type_local=type_local_list,
    ), 3000
