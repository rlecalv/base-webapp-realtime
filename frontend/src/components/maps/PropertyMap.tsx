'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Comparable {
  id: number;
  adresse: string;
  latitude: number;
  longitude: number;
  prix: number;
  prix_m2: number;
  surface: number;
  distance_bien?: number;
}

interface PropertyMapProps {
  propertyLat?: number;
  propertyLon?: number;
  propertyAddress?: string;
  comparables?: Comparable[];
  className?: string;
}

export function PropertyMap({
  propertyLat,
  propertyLon,
  propertyAddress,
  comparables = [],
  className = 'h-96 w-full rounded-lg'
}: PropertyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Créer l'icône verte stylée pour le bien estimé (pin plus grand et distinctif)
    const greenIcon = L.divIcon({
      className: 'custom-marker-green',
      html: `
        <div style="
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: 4px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 6px 16px rgba(16, 185, 129, 0.5), 0 0 0 3px rgba(16, 185, 129, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <div style="
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 14px;
            color: #059669;
          ">🏠</div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 48],
      popupAnchor: [0, -48],
    });

    // Créer l'icône bleue stylée pour les comparables (pin distinctif)
    const blueIcon = L.divIcon({
      className: 'custom-marker-blue',
      html: `
        <div style="
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border: 3px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4), 0 0 0 2px rgba(59, 130, 246, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            transform: rotate(45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
          ">📍</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36],
    });

    // Initialiser la carte
    if (!mapRef.current) {
      const centerLat = propertyLat || (comparables.length > 0 ? comparables[0].latitude : 48.8566);
      const centerLon = propertyLon || (comparables.length > 0 ? comparables[0].longitude : 2.3522);

      mapRef.current = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: 13,
        zoomControl: true,
      });

      // Ajouter le fond de carte avec style moderne (CartoDB Positron)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Nettoyer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());

    // Ajouter le marqueur du bien estimé
    if (propertyLat && propertyLon) {
      const propertyMarker = L.marker([propertyLat, propertyLon], { icon: greenIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: system-ui; padding: 8px;">
            <div style="font-weight: bold; color: #059669; margin-bottom: 4px;">
              🏠 Votre bien
            </div>
            <div style="font-size: 12px; color: #374151;">
              ${propertyAddress || 'Bien estimé'}
            </div>
          </div>
        `);

      markersRef.current.push(propertyMarker);

      // Ajouter un cercle de référence autour du bien (rayon 2km)
      const circle = L.circle([propertyLat, propertyLon], {
        radius: 2000, // 2km en mètres
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      // Centrer la carte sur le bien
      map.setView([propertyLat, propertyLon], 13);
    }

    // Ajouter les marqueurs des comparables
    comparables.forEach((comp) => {
      if (comp.latitude && comp.longitude) {
        const priceFormatted = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(comp.prix);

        const priceM2Formatted = new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
          maximumFractionDigits: 0,
        }).format(comp.prix_m2);

        const compMarker = L.marker([comp.latitude, comp.longitude], { icon: blueIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: system-ui; padding: 8px; min-width: 200px;">
              <div style="font-weight: bold; color: #2563eb; margin-bottom: 6px;">
                📍 Comparable
              </div>
              <div style="font-size: 12px; color: #374151; margin-bottom: 4px;">
                ${comp.adresse}
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <div>
                  <div style="font-size: 11px; color: #6b7280;">Prix</div>
                  <div style="font-weight: bold; color: #1f2937; font-size: 14px;">${priceFormatted}</div>
                </div>
                <div>
                  <div style="font-size: 11px; color: #6b7280;">Prix/m²</div>
                  <div style="font-weight: bold; color: #2563eb; font-size: 14px;">${priceM2Formatted}</div>
                </div>
              </div>
              <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
                ${comp.surface} m²${comp.distance_bien ? ` • ${comp.distance_bien.toFixed(2)} km` : ''}
              </div>
            </div>
          `);

        markersRef.current.push(compMarker);
      }
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (markersRef.current.length > 0) {
      const group = new L.FeatureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.1));
    }

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [propertyLat, propertyLon, propertyAddress, comparables]);

  return (
    <div className={className}>
      <div ref={mapContainerRef} className="h-full w-full rounded-lg border-2 border-gray-200 shadow-lg" />
      <style jsx global>{`
        .custom-marker-green {
          background: transparent !important;
          border: none !important;
        }
        .custom-marker-blue {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
}

