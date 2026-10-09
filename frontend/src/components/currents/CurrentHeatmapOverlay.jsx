import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * CurrentHeatmapOverlay Component
 * 
 * Smooth, high-performance HTML5 Canvas severity heatmap overlay for Leaflet.
 * Renders data-driven intensity gradients based on actual ocean current velocity,
 * anomaly calculations, or operational risk thresholds.
 */
export default function CurrentHeatmapOverlay({
  data = [],
  metric = 'SPEED', // 'SPEED' | 'ANOMALY' | 'SEVERITY'
  opacity = 0.65,
  visible = true
}) {
  const map = useMap();
  const canvasRef = useRef(null);

  useEffect(() => {
    let canvas = canvasRef.current;

    if (!visible || !data || data.length === 0) {
      if (canvas && canvas.getContext) {
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    // Attach canvas to overlayPane if not attached
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'leaflet-heatmap-canvas pointer-events-none absolute inset-0 z-[350]';
      canvas.style.pointerEvents = 'none';
      canvasRef.current = canvas;
      const pane = map.getPanes().overlayPane;
      pane.appendChild(canvas);
    }

    const drawHeatmap = () => {
      if (!canvas || !visible) return;
      const size = map.getSize();
      const bounds = map.getBounds();
      
      const dpr = window.devicePixelRatio || 1;
      canvas.width = size.x * dpr;
      canvas.height = size.y * dpr;
      canvas.style.width = `${size.x}px`;
      canvas.style.height = `${size.y}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(dpr, dpr);

      // Reposition canvas relative to current Leaflet layer origin
      const topLeft = map.containerPointToLayerPoint([0, 0]);
      L.DomUtil.setPosition(canvas, topLeft);

      const zoom = map.getZoom();
      // Radius scales smoothly with map zoom level
      const radius = Math.max(24, Math.min(85, Math.pow(zoom, 1.6) * 1.85));

      data.forEach(pt => {
        const lat = Number(pt.latitude);
        const lon = Number(pt.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return;
        
        // Exclude points outside padded view bounds
        if (!bounds.pad(0.3).contains([lat, lon])) return;

        const containerPt = map.latLngToContainerPoint([lat, lon]);
        const x = containerPt.x;
        const y = containerPt.y;

        // Calculate speed if missing
        let speed = Number(pt.speed);
        if (!Number.isFinite(speed)) {
          const u = Number(pt.u) || 0;
          const v = Number(pt.v) || 0;
          speed = Math.sqrt(u * u + v * v);
        }

        // Determine intensity (0.0 to 1.0) and color ramp palette based on active metric
        let intensity = 0;
        let colorStops = [];

        if (metric === 'ANOMALY') {
          // Statistical anomaly relative to baseline mean speed (~0.15 m/s)
          const anomaly = Math.abs(speed - 0.15);
          intensity = Math.min(1.0, anomaly / 0.25);
          colorStops = [
            { pos: 0.0, r: 0, g: 245, b: 212 },   // Normal Baseline (< 0.05 m/s dev) - Cyan
            { pos: 0.35, r: 201, g: 169, b: 97 }, // Moderate Anomaly (0.05-0.12) - Gold
            { pos: 0.70, r: 247, g: 127, b: 0 },  // High Anomaly (0.12-0.22) - Orange
            { pos: 1.0, r: 225, g: 29, b: 72 }    // Extreme Anomaly (> 0.22) - Deep Crimson
          ];
        } else if (metric === 'SEVERITY') {
          // Operational Risk Engine Severity
          let riskScore = 1;
          if (speed >= 0.35) riskScore = 4;
          else if (speed >= 0.25) riskScore = 3;
          else if (speed >= 0.15) riskScore = 2;

          intensity = (riskScore - 1) / 3;
          colorStops = [
            { pos: 0.0, r: 0, g: 245, b: 212 },   // Low Operational Risk - Cyan
            { pos: 0.33, r: 201, g: 169, b: 97 }, // Moderate Operational Risk - Gold
            { pos: 0.66, r: 247, g: 127, b: 0 },  // High Operational Risk - Orange
            { pos: 1.0, r: 214, g: 40, b: 40 }    // Very High Operational Risk - Red
          ];
        } else {
          // Default: Current Speed Intensity
          intensity = Math.min(1.0, speed / 0.40);
          colorStops = [
            { pos: 0.0, r: 34, g: 197, b: 94 },   // Normal Speed (< 0.10 m/s) - Green
            { pos: 0.30, r: 34, g: 197, b: 94 },  // Normal Speed (0.10-0.20 m/s) - Green
            { pos: 0.65, r: 249, g: 115, b: 22 }, // Medium Speed (0.20-0.35 m/s) - Orange
            { pos: 1.0, r: 239, g: 68, b: 68 }    // High Speed (> 0.35 m/s) - Red
          ];
        }

        // Interpolate RGBA color
        let r = colorStops[0].r, g = colorStops[0].g, b = colorStops[0].b;
        for (let i = 0; i < colorStops.length - 1; i++) {
          if (intensity >= colorStops[i].pos && intensity <= colorStops[i + 1].pos) {
            const range = colorStops[i + 1].pos - colorStops[i].pos;
            const factor = range > 0 ? (intensity - colorStops[i].pos) / range : 0;
            r = Math.round(colorStops[i].r + factor * (colorStops[i + 1].r - colorStops[i].r));
            g = Math.round(colorStops[i].g + factor * (colorStops[i + 1].g - colorStops[i].g));
            b = Math.round(colorStops[i].b + factor * (colorStops[i + 1].b - colorStops[i].b));
            break;
          }
        }
        if (intensity > colorStops[colorStops.length - 1].pos) {
          const last = colorStops[colorStops.length - 1];
          r = last.r; g = last.g; b = last.b;
        }

        // Create smooth radial gradient spotlight
        const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const alphaPeak = Math.min(0.95, (0.35 + intensity * 0.6) * opacity);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alphaPeak})`);
        grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, ${alphaPeak * 0.45})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.beginPath();
        ctx.fillStyle = grad;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    drawHeatmap();

    const onMapEvent = () => drawHeatmap();
    map.on('move moveend zoom zoomend viewreset resize', onMapEvent);

    return () => {
      map.off('move moveend zoom zoomend viewreset resize', onMapEvent);
      if (canvasRef.current && canvasRef.current.parentNode) {
        canvasRef.current.parentNode.removeChild(canvasRef.current);
        canvasRef.current = null;
      }
    };
  }, [map, data, metric, opacity, visible]);

  return null;
}
