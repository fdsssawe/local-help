"use client";

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_API_KEY!;

interface MapProps {
  center: [number, number];
  zoom: number;
}

const Map: React.FC<MapProps> = ({ center, zoom }) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapInstance.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center,
        zoom,
        scrollZoom: false, // Disable scroll zoom
      });

      new mapboxgl.Marker().setLngLat(center).addTo(map);

      mapInstance.current = map;
    }
  }, [center, zoom]);

  return <div ref={mapContainer} className="map-container" />;
};

export default Map;
