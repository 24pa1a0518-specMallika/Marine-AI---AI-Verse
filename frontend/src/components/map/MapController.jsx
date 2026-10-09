import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export default function MapController({
  center,
  zoom,
  zoomInTrigger,
  zoomOutTrigger,
  recenterTrigger
}) {
  const map = useMap();

  // Enable scroll wheel zoom, touch zoom, double click zoom, dragging
  useEffect(() => {
    if (!map) return;
    map.scrollWheelZoom.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.dragging.enable();
  }, [map]);

  // Recenter when location center prop changes
  useEffect(() => {
    if (!map || !center || center.length < 2) return;
    if (typeof center[0] === 'number' && typeof center[1] === 'number' && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || map.getZoom() || 10, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [map, center?.[0], center?.[1]]);

  // Zoom In Trigger
  useEffect(() => {
    if (!map || zoomInTrigger === undefined || zoomInTrigger === 0) return;
    map.zoomIn();
  }, [zoomInTrigger]);

  // Zoom Out Trigger
  useEffect(() => {
    if (!map || zoomOutTrigger === undefined || zoomOutTrigger === 0) return;
    map.zoomOut();
  }, [zoomOutTrigger]);

  // Recenter Trigger
  useEffect(() => {
    if (!map || recenterTrigger === undefined || recenterTrigger === 0) return;
    if (center && center.length >= 2) {
      map.flyTo(center, 10, { duration: 1.0 });
    }
  }, [recenterTrigger]);

  return null;
}
