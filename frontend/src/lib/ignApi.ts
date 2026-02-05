/**
 * Service pour l'API IGN Géoportail - Autocomplétion d'adresses
 * Documentation: https://geoservices.ign.fr/documentation/services/api-geocodage
 */

export interface IGNAddress {
  label: string;
  housenumber?: string;
  street?: string;
  postcode: string;
  city: string;
  context: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface IGNResponse {
  features: Array<{
    properties: {
      label: string;
      housenumber?: string;
      street?: string;
      postcode: string;
      city: string;
      context: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number];
    };
  }>;
}

/**
 * Recherche d'adresses via l'API IGN Géoportail
 * Note: L'API IGN nécessite une clé API. Pour le développement, on peut utiliser l'API publique limitée.
 * En production, il faudra obtenir une clé API IGN.
 */
export async function searchAddresses(query: string): Promise<IGNAddress[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    // API IGN Géoportail - Autocomplétion
    // Documentation: https://geoservices.ign.fr/documentation/services/api-geocodage
    // Note: Cette URL utilise l'API publique limitée. Pour la production, utiliser une clé API.
    const response = await fetch(
      `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&type=housenumber&autocomplete=1`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Erreur lors de la recherche d\'adresses');
    }

    const data = await response.json();
    
    return data.features?.map((feature: any) => ({
      label: feature.properties.label,
      housenumber: feature.properties.housenumber,
      street: feature.properties.street,
      postcode: feature.properties.postcode,
      city: feature.properties.city,
      context: feature.properties.context,
      geometry: {
        type: feature.geometry.type,
        coordinates: feature.geometry.coordinates,
      },
    })) || [];
  } catch (error) {
    console.error('Erreur lors de la recherche d\'adresses:', error);
    return [];
  }
}

