import { useEffect, useRef, useState } from 'react';
import type { NearbyPlace } from 'shared';
import { loadGoogleMaps } from '../../lib/googleMapsLoader';

interface PropertyMapProps {
  lat: number;
  lng: number;
  places: NearbyPlace[];
}

export function PropertyMap({ lat, lng, places }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: { lat, lng },
          zoom: 14,
          disableDefaultUI: true,
          zoomControl: true,
        });
        new google.maps.Marker({
          position: { lat, lng },
          map: mapRef.current,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#E24B4A',
            fillOpacity: 1,
            strokeColor: '#fff',
            strokeWeight: 2,
          },
        });
        setReady(true);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load map'));
    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = places
      .filter((p): p is NearbyPlace & { lat: number; lng: number } => p.lat !== null && p.lng !== null)
      .map((p) => new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map: mapRef.current!, title: p.name }));
  }, [ready, places]);

  if (error) {
    return (
      <div className="mph" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
        Map unavailable
      </div>
    );
  }

  return <div ref={containerRef} className="mph" />;
}
