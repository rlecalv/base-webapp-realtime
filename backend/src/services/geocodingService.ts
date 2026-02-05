import axios from 'axios';

/**
 * Service de géocodage d'adresses
 * Utilise l'API adresse.data.gouv.fr (gratuite et sans limite)
 * Documentation: https://adresse.data.gouv.fr/api-doc/adresse
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  label: string;
  housenumber?: string;
  street?: string;
  postcode: string;
  city: string;
}

/**
 * Géocode une adresse complète pour obtenir ses coordonnées GPS
 */
export async function geocodeAddress(
  adresse: string,
  codePostal?: string,
  ville?: string
): Promise<GeocodingResult | null> {
  try {
    // Construire la requête de recherche
    let query = adresse.trim();
    if (codePostal) {
      query += ` ${codePostal}`;
    }
    if (ville) {
      query += ` ${ville}`;
    }

    const response = await axios.get('https://api-adresse.data.gouv.fr/search/', {
      params: {
        q: query,
        limit: 1,
        type: 'housenumber'
      },
      timeout: 5000,
      headers: {
        'User-Agent': 'MonEstimation/1.0 (contact@monestimation.fr)',
        'Accept': 'application/json'
      }
    });

    if (!response.data || !response.data.features || response.data.features.length === 0) {
      console.warn(`Aucun résultat de géocodage pour: ${query}`);
      return null;
    }

    const feature = response.data.features[0];
    const coordinates = feature.geometry.coordinates; // [longitude, latitude]

    return {
      latitude: coordinates[1],
      longitude: coordinates[0],
      label: feature.properties.label,
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
      postcode: feature.properties.postcode,
      city: feature.properties.city
    };
  } catch (error) {
    console.error(`Erreur lors du géocodage de l'adresse ${adresse}:`, error);
    return null;
  }
}

/**
 * Géocode une adresse et retourne uniquement les coordonnées GPS
 */
export async function geocodeAddressToCoordinates(
  adresse: string,
  codePostal?: string,
  ville?: string
): Promise<{ latitude: number; longitude: number } | null> {
  const result = await geocodeAddress(adresse, codePostal, ville);
  if (!result) {
    return null;
  }
  return {
    latitude: result.latitude,
    longitude: result.longitude
  };
}

