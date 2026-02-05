"""
Moteur d'estimation immobilière.

Algorithme multi-méthodes avec décotes simplifiées et cumulables.
"""

from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import uuid4

import numpy as np

from app.models.schemas import (
    Comparable,
    Decote,
    DecotesResult,
    EstimationRequest,
    EstimationResponse,
    MethodeDetail,
)
from app.services.bdnb_service import get_batiment_proche
from app.services.dvf_service import rechercher_avec_rayon_adaptatif
from app.services.geocoding_service import geocoder_adresse


# === DÉCOTES SIMPLIFIÉES ===


class DecotesImmeuble:
    """Décotes cumulables, plafonnées à 45%."""

    DPE = {
        "A": Decimal("0.00"),
        "B": Decimal("0.00"),
        "C": Decimal("0.00"),
        "D": Decimal("0.00"),
        "E": Decimal("0.05"),
        "F": Decimal("0.10"),
        "G": Decimal("0.15"),
    }

    BAIL = {
        "nu": Decimal("0.00"),
        "meuble": Decimal("0.00"),
        "commercial": Decimal("0.05"),
        "loi_48": Decimal("0.15"),
    }

    ETAT = {
        "neuf": Decimal("-0.05"),  # Bonus
        "bon": Decimal("0.00"),
        "moyen": Decimal("0.05"),
        "travaux": Decimal("0.15"),
    }

    PLAFOND = Decimal("0.45")


def calculer_decotes(
    type_bien: str,
    nb_lots: int,
    occupe: bool,
    dpe: Optional[str],
    type_bail: Optional[str],
    etat: str,
    locataire_age: Optional[int] = None,
    copro_difficulte: bool = False,
) -> DecotesResult:
    """Calcule les décotes cumulables."""
    decotes: list[Decote] = []
    total = Decimal("0")

    # 1. Décote bloc
    if type_bien in ["immeuble_bloc", "part_indivise"]:
        taux = Decimal("0.20") if nb_lots > 10 else Decimal("0.15")
        decotes.append(Decote(nom="Achat en bloc", taux=taux))
        total += taux

    # 2. Occupation
    if occupe:
        decotes.append(Decote(nom="Occupation", taux=Decimal("0.10")))
        total += Decimal("0.10")

        # Type de bail
        if type_bail and type_bail in DecotesImmeuble.BAIL:
            taux_bail = DecotesImmeuble.BAIL[type_bail]
            if taux_bail > 0:
                decotes.append(Decote(nom=f"Bail {type_bail}", taux=taux_bail))
                total += taux_bail

        # Locataire âgé
        if locataire_age and locataire_age >= 75:
            decotes.append(Decote(nom="Locataire > 75 ans", taux=Decimal("0.05")))
            total += Decimal("0.05")

    # 3. DPE
    if dpe and dpe in DecotesImmeuble.DPE:
        taux_dpe = DecotesImmeuble.DPE[dpe]
        if taux_dpe > 0:
            decotes.append(Decote(nom=f"DPE {dpe}", taux=taux_dpe))
            total += taux_dpe

    # 4. État
    if etat and etat in DecotesImmeuble.ETAT:
        taux_etat = DecotesImmeuble.ETAT[etat]
        if taux_etat != 0:
            nom = "Bonus neuf" if taux_etat < 0 else f"État {etat}"
            decotes.append(Decote(nom=nom, taux=taux_etat))
            total += taux_etat

    # 5. Copropriété en difficulté
    if copro_difficulte:
        decotes.append(Decote(nom="Copropriété en difficulté", taux=Decimal("0.10")))
        total += Decimal("0.10")

    # Plafonnement
    plafonne = total >= DecotesImmeuble.PLAFOND
    total = min(total, DecotesImmeuble.PLAFOND)

    return DecotesResult(
        decotes=decotes,
        total=total,
        coefficient=Decimal("1") - total,
        plafonne=plafonne,
    )


# === MÉTHODES D'ESTIMATION ===


def calculer_statistiques_comparables(
    comparables: list[Comparable],
) -> dict:
    """Calcule les statistiques sur les prix/m²."""
    prix_m2_list = [c.prix_m2 for c in comparables if c.prix_m2 and c.prix_m2 > 0]

    if not prix_m2_list:
        return {"median": 0, "q1": 0, "q3": 0}

    # Filtrage IQR
    q1, q3 = np.percentile(prix_m2_list, [25, 75])
    iqr = q3 - q1
    prix_filtre = [p for p in prix_m2_list if q1 - 1.5 * iqr <= p <= q3 + 1.5 * iqr]

    if not prix_filtre:
        prix_filtre = prix_m2_list

    return {
        "median": float(np.median(prix_filtre)),
        "q1": float(q1),
        "q3": float(q3),
    }


def calculer_valeur_capitalisation(
    loyer_habitation: float,
    loyer_commerce: float,
    loyer_bureau: float,
    loyer_parking: float,
    dpe: Optional[str] = None,
) -> Optional[float]:
    """Calcule la valeur par capitalisation des revenus."""
    # Taux de capitalisation IDF 2025
    taux_habitation = 0.045
    if dpe in ["F", "G"]:
        taux_habitation = 0.060
    elif dpe in ["A", "B", "C"]:
        taux_habitation = 0.040

    taux_commerce = 0.065
    taux_bureau = 0.055
    taux_parking = 0.08

    valeur = 0
    if loyer_habitation > 0:
        valeur += loyer_habitation / taux_habitation
    if loyer_commerce > 0:
        valeur += loyer_commerce / taux_commerce
    if loyer_bureau > 0:
        valeur += loyer_bureau / taux_bureau
    if loyer_parking > 0:
        valeur += loyer_parking / taux_parking

    return valeur if valeur > 0 else None


def calculer_coefficient_hedonique(
    annee_construction: Optional[int],
    dpe: Optional[str],
) -> float:
    """Calcule le coefficient d'ajustement hédonique."""
    coef = 1.0

    # Ancienneté
    if annee_construction:
        age = datetime.now().year - annee_construction
        if age < 5:
            coef *= 1.05
        elif age < 15:
            coef *= 1.02
        elif age > 50:
            coef *= 0.97
        elif age > 100:
            coef *= 0.95

    # DPE (bonus/malus léger, décote principale séparée)
    if dpe:
        dpe_coef = {
            "A": 1.03,
            "B": 1.02,
            "C": 1.00,
            "D": 0.99,
            "E": 0.97,
            "F": 0.94,
            "G": 0.90,
        }
        coef *= dpe_coef.get(dpe, 1.0)

    return coef


def calculer_confiance(nb_comparables: int, rayon_m: int, q1: float, q3: float, median: float) -> int:
    """Score de confiance 0-100."""
    score = 0

    # Nombre de comparables (max 60 pts)
    if nb_comparables >= 15:
        score += 60
    elif nb_comparables >= 8:
        score += 45
    elif nb_comparables >= 4:
        score += 30
    else:
        score += nb_comparables * 7

    # Rayon serré (max 25 pts)
    if rayon_m <= 500:
        score += 25
    elif rayon_m <= 1000:
        score += 15
    else:
        score += 5

    # Dispersion faible (max 15 pts)
    dispersion = (q3 - q1) / median if median > 0 else 1
    if dispersion < 0.25:
        score += 15
    elif dispersion < 0.40:
        score += 10
    else:
        score += 5

    return min(score, 100)


# === ESTIMATION PRINCIPALE ===


async def calculer_estimation(request: EstimationRequest) -> EstimationResponse:
    """
    Calcule l'estimation complète d'un bien immobilier.

    Combine méthode comparative DVF, capitalisation (si loyers), et ajustements hédoniques.
    """
    # 1. Géocodage si coordonnées manquantes
    latitude = request.latitude
    longitude = request.longitude

    if not latitude or not longitude:
        coords = await geocoder_adresse(
            request.adresse, request.code_postal, request.ville
        )
        if coords:
            latitude, longitude = coords
        else:
            raise ValueError(
                f"Impossible de géocoder l'adresse: {request.adresse}, {request.code_postal} {request.ville}"
            )

    # 2. Mapping type bien → type local DVF
    type_local_mapping = {
        "appartement": "Appartement",
        "maison": "Maison",
        "immeuble_bloc": None,  # Recherche tous types
        "part_indivise": None,
    }
    type_local = type_local_mapping.get(request.type)

    # 3. Recherche comparables DVF
    comparables, rayon = await rechercher_avec_rayon_adaptatif(
        latitude=latitude,
        longitude=longitude,
        surface=request.surface_totale,
        type_local=type_local,
    )

    if not comparables:
        raise ValueError(
            f"Aucun comparable trouvé pour {request.code_postal} {request.ville}. "
            "Veuillez vérifier que des données DVF sont disponibles pour cette zone."
        )

    # 4. Statistiques prix/m²
    stats = calculer_statistiques_comparables(comparables)
    if stats["median"] == 0:
        raise ValueError("Impossible de calculer un prix médian à partir des comparables.")

    # 5. Enrichissement BDNB
    bdnb_data = await get_batiment_proche(latitude, longitude)
    annee = request.annee_construction or (bdnb_data.annee_construction if bdnb_data else None)
    dpe = request.dpe or (bdnb_data.classe_dpe if bdnb_data else None)

    # 6. Coefficient hédonique
    coef_hedonique = calculer_coefficient_hedonique(annee, dpe)

    # 7. Valeur comparative
    valeur_comparative = stats["median"] * request.surface_totale * coef_hedonique

    # 8. Valeur capitalisation (si loyers fournis)
    valeur_capi = calculer_valeur_capitalisation(
        request.loyer_habitation or 0,
        request.loyer_commerce or 0,
        request.loyer_bureau or 0,
        request.loyer_parking or 0,
        dpe,
    )

    # 9. Pondération finale
    if valeur_capi:
        poids = {"comparative": 0.50, "capitalisation": 0.35, "hedonique": 0.15}
        valeur_base = (
            valeur_comparative * poids["comparative"]
            + valeur_capi * poids["capitalisation"]
            + valeur_comparative * poids["hedonique"]
        )
    else:
        poids = {"comparative": 0.70, "capitalisation": 0.00, "hedonique": 0.30}
        valeur_base = valeur_comparative

    # 10. Calcul décotes
    decotes = calculer_decotes(
        type_bien=request.type,
        nb_lots=request.nb_lots or 1,
        occupe=request.occupe,
        dpe=dpe,
        type_bail=request.type_bail,
        etat=request.etat_general,
        locataire_age=request.locataire_age,
        copro_difficulte=request.copro_difficulte,
    )

    # 11. Valeur finale
    valeur_finale = float(valeur_base) * float(decotes.coefficient)

    # Quote-part pour parts indivises
    if request.type == "part_indivise" and request.quote_part:
        valeur_finale *= request.quote_part

    # 12. Fourchette
    valeur_min = stats["q1"] * request.surface_totale * float(decotes.coefficient) * 0.95
    valeur_max = stats["q3"] * request.surface_totale * float(decotes.coefficient) * 1.05

    if request.type == "part_indivise" and request.quote_part:
        valeur_min *= request.quote_part
        valeur_max *= request.quote_part

    # 13. Score de confiance
    confiance = calculer_confiance(
        len(comparables), rayon, stats["q1"], stats["q3"], stats["median"]
    )

    return EstimationResponse(
        id=str(uuid4()),
        valeur_estimee=int(valeur_finale),
        valeur_min=int(valeur_min),
        valeur_max=int(valeur_max),
        confiance=confiance,
        nombre_comparables=len(comparables),
        rayon_recherche_m=rayon,
        prix_m2_median=round(stats["median"], 2),
        decotes=decotes,
        methodes={
            "comparative": MethodeDetail(
                poids=poids["comparative"], valeur=round(valeur_comparative, 0)
            ),
            "capitalisation": MethodeDetail(
                poids=poids["capitalisation"],
                valeur=round(valeur_capi, 0) if valeur_capi else None,
            ),
            "hedonique": MethodeDetail(
                poids=poids["hedonique"], coefficient=round(coef_hedonique, 3)
            ),
        },
        comparables=comparables[:10],  # Top 10 pour affichage
        created_at=datetime.now(),
    )
