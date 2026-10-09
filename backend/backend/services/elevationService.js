async function getElevationRestrictedCells(coordinatesGrid) {
  const restrictedCells = [];
  const coordsList = [];
  
  // Flatten grid
  coordinatesGrid.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      coordsList.push({ lat: cell.latitude, lon: cell.longitude, row: rowIndex, col: colIndex });
    });
  });

  // Process in chunks of 100
  const chunkSize = 100;
  for (let i = 0; i < coordsList.length; i += chunkSize) {
    const chunk = coordsList.slice(i, i + chunkSize);
    const lats = chunk.map(c => c.lat.toFixed(4)).join(',');
    const lons = chunk.map(c => c.lon.toFixed(4)).join(',');
    
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/elevation?latitude=${lats}&longitude=${lons}`);
      if (!response.ok) {
        console.warn(`[ElevationService] Failed to fetch elevation, status: ${response.status}. Using heuristic fallback for chunk.`);
        // Heuristic fallback for East Coast of India: if longitude is less than a base threshold, it's land.
        // Assuming chunk[0] is somewhat near the port, we'll assume lon < 80.0 is definitely land. 
        // More dynamically, let's just mark cells with lon < 80.2 as land if we are in Chennai, etc.
        chunk.forEach((c) => {
          if (c.lon < 80.25 || (c.lat > 16.0 && c.lon < 82.2)) {
            restrictedCells.push({ row: c.row, col: c.col });
          }
        });
        continue;
      }
      
      const data = await response.json();
      if (data && data.elevation) {
        data.elevation.forEach((elev, idx) => {
          if (elev > 0) {
            restrictedCells.push({ row: chunk[idx].row, col: chunk[idx].col });
          }
        });
      }
    } catch (err) {
      console.warn("[ElevationService] Elevation API error:", err.message);
      // Fallback
      chunk.forEach((c) => {
        if (c.lon < 80.25 || (c.lat > 16.0 && c.lon < 82.2)) {
          restrictedCells.push({ row: c.row, col: c.col });
        }
      });
    }
  }
  
  return restrictedCells;
}

module.exports = { getElevationRestrictedCells };
