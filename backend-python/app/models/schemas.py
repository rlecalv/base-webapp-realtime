"""
Schémas Pydantic pour l'API d'estimation.
"""

from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


# === REQUÊTES ===


class EstimationRequest(BaseModel):
    """Requête de création d'estimation."""

    type: Literal["appartement", "maison", "immeuble_bloc", "part_indivise"]
    adresse: str = Field(..., min_length=3)
    code_postal: str = Field(..., pattern=r"^\d{5}$")
    ville: str = Field(..., min_length=2)
    surface_totale: float = Field(..., gt=0)
    etat_general: Literal["neuf", "bon", "moyen", "travaux"] = "bon"
    methode: Literal["comparables_dvf", "mixte"] = "mixte"

    # Optionnels
    annee_construction: Optional[int] = None
    nb_lots: Optional[int] = Field(default=1, ge=1)
    quote_part: Optional[float] = Field(default=None, gt=0, le=1)
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Caractéristiques
    dpe: Optional[Literal["A", "B", "C", "D", "E", "F", "G"]] = None
    occupe: bool = False
    type_bail: Optional[Literal["nu", "meuble", "commercial", "loi_48"]] = None
    locataire_age: Optional[int] = Field(default=None, ge=0)
    copro_difficulte: bool = False

    # Loyers annuels (pour méthode capitalisation)
    loyer_habitation: Optional[float] = Field(default=None, ge=0)
    loyer_commerce: Optional[float] = Field(default=None, ge=0)
    loyer_bureau: Optional[float] = Field(default=None, ge=0)
    loyer_parking: Optional[float] = Field(default=None, ge=0)


class LeadRequest(BaseModel):
    """Requête de capture de lead."""

    email: str
    telephone: Optional[str] = None
    nom: Optional[str] = None
    estimation_id: Optional[str] = None
    source: str = "web"


# === RÉPONSES ===


class Comparable(BaseModel):
    """Transaction comparable DVF."""

    id: int
    adresse: str
    date_mutation: date
    valeur_fonciere: Decimal
    surface: Optional[float]
    prix_m2: Optional[float]
    type_local: Optional[str]
    distance_m: Optional[float] = None
    annee_construction: Optional[int] = None


class Decote(BaseModel):
    """Détail d'une décote appliquée."""

    nom: str
    taux: Decimal


class DecotesResult(BaseModel):
    """Résultat du calcul des décotes."""

    decotes: list[Decote]
    total: Decimal
    coefficient: Decimal
    plafonne: bool


class MethodeDetail(BaseModel):
    """Détail d'une méthode d'estimation."""

    poids: float
    valeur: Optional[float] = None
    coefficient: Optional[float] = None


class EstimationResponse(BaseModel):
    """Réponse d'estimation complète."""

    id: str
    valeur_estimee: int
    valeur_min: int
    valeur_max: int
    confiance: int
    nombre_comparables: int
    rayon_recherche_m: int
    prix_m2_median: float
    decotes: DecotesResult
    methodes: dict[str, MethodeDetail]
    comparables: list[Comparable]
    created_at: datetime


class ApiResponse(BaseModel):
    """Wrapper de réponse API."""

    success: bool = True
    data: Optional[dict] = None
    error: Optional[str] = None


class ComparablesSearchParams(BaseModel):
    """Paramètres de recherche de comparables."""

    latitude: float
    longitude: float
    rayon_m: int = Field(default=1000, ge=100, le=5000)
    type_local: Optional[Literal["Appartement", "Maison", "Local"]] = None
    surface_min: Optional[float] = Field(default=None, gt=0)
    surface_max: Optional[float] = Field(default=None, gt=0)
    date_min: Optional[date] = None
