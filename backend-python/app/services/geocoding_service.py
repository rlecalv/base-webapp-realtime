"""
Service de géocodage via API IGN.
"""

from typing import Optional

import httpx


async def geocoder_adresse(
    adresse: str,
    code_postal: str,
    ville: str,
) -> Optional[tuple[float, float]]:
    """
    Géocode une adresse via l'API Adresse (data.gouv.fr).

    Retourne (latitude, longitude) ou None.
    """
    query = f"{adresse}, {code_postal} {ville}"

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            response = await client.get(
                "https://api-adresse.data.gouv.fr/search/",
                params={"q": query, "limit": 1},
            )
            response.raise_for_status()
            data = response.json()

            if data.get("features"):
                coords = data["features"][0]["geometry"]["coordinates"]
                # API retourne [longitude, latitude]
                return coords[1], coords[0]

        except Exception:
            pass

    return None
