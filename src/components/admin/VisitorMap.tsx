import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, MapPin } from 'lucide-react';

interface VisitorLocation {
  country: string;
  countryCode: string;
  city: string;
  lat: number;
  lon: number;
  count: number;
}

interface VisitorMapProps {
  locations: VisitorLocation[];
}

const VisitorMap: React.FC<VisitorMapProps> = ({ locations }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainer.current) return;

      try {
        // Get Mapbox token from edge function
        const { data, error: tokenError } = await supabase.functions.invoke('get-mapbox-token');
        
        if (tokenError || !data?.token) {
          setError('Failed to load map configuration');
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = data.token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/dark-v11',
          projection: 'globe',
          zoom: 1.5,
          center: [0, 20],
          pitch: 20,
        });

        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        map.current.scrollZoom.disable();

        map.current.on('style.load', () => {
          map.current?.setFog({
            color: 'rgb(20, 20, 30)',
            'high-color': 'rgb(40, 40, 60)',
            'horizon-blend': 0.2,
          });
        });

        // Globe rotation
        const secondsPerRevolution = 180;
        const maxSpinZoom = 5;
        const slowSpinZoom = 3;
        let userInteracting = false;
        let spinEnabled = true;

        function spinGlobe() {
          if (!map.current) return;
          const zoom = map.current.getZoom();
          if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
              const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
              distancePerSecond *= zoomDif;
            }
            const center = map.current.getCenter();
            center.lng -= distancePerSecond;
            map.current.easeTo({ center, duration: 1000, easing: (n) => n });
          }
        }

        map.current.on('mousedown', () => { userInteracting = true; });
        map.current.on('dragstart', () => { userInteracting = true; });
        map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
        map.current.on('touchend', () => { userInteracting = false; spinGlobe(); });
        map.current.on('moveend', () => { spinGlobe(); });

        map.current.on('load', () => {
          setLoading(false);
          spinGlobe();
          addMarkers();
        });

      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to initialize map');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, []);

  const addMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for each location
    locations.forEach((loc) => {
      if (loc.lat === 0 && loc.lon === 0) return;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'visitor-marker';
      el.style.cssText = `
        width: ${Math.min(12 + loc.count * 2, 32)}px;
        height: ${Math.min(12 + loc.count * 2, 32)}px;
        background: radial-gradient(circle, hsl(45, 100%, 60%) 0%, hsl(45, 100%, 40%) 100%);
        border-radius: 50%;
        border: 2px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 0 10px rgba(255, 200, 50, 0.5);
        cursor: pointer;
        transition: transform 0.2s;
      `;
      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div style="padding: 8px; font-family: system-ui;">
          <strong style="font-size: 14px;">${loc.city}, ${loc.country}</strong>
          <p style="margin: 4px 0 0; color: #666; font-size: 12px;">${loc.count} visit${loc.count > 1 ? 's' : ''}</p>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.lon, loc.lat])
        .setPopup(popup)
        .addTo(map.current!);

      markersRef.current.push(marker);
    });
  };

  // Update markers when locations change
  useEffect(() => {
    if (map.current && !loading) {
      addMarkers();
    }
  }, [locations, loading]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-muted/20 rounded-lg">
        <MapPin className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapContainer} className="absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-background/10 rounded-lg" />
    </div>
  );
};

export default VisitorMap;
