import {
  FortyGuardEnvParamsResult,
  FortyGuardHeatmapResult,
  HeatmapTileFeature,
  SiteThermalData,
} from "./types";

/**
 * Fahrenheit to Celsius converter
 */
export function fahrenheitToCelsius(f: number): number {
  return Number((((f - 32) * 5) / 9).toFixed(1));
}

/**
 * Celsius to Fahrenheit converter
 */
export function celsiusToFahrenheit(c: number): number {
  return Number(((c * 9) / 5 + 32).toFixed(1));
}

/**
 * Generate a procedural microclimate heat grid for any project boundary
 */
export function generateProceduralMockData(
  projectId: string,
  lat: number,
  lng: number,
  bbox?: { minX: number; minY: number; maxX: number; maxY: number },
): SiteThermalData {
  const minX = bbox?.minX ?? -250;
  const maxX = bbox?.maxX ?? 250;
  const minY = bbox?.minY ?? -250;
  const maxY = bbox?.maxY ?? 250;

  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);

  // Approximate meters to lat/lng degrees
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);

  const gridSize = 12; // 12x12 grid
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;

  const features: HeatmapTileFeature[] = [];
  let sumTemp = 0;
  let minTemp = 999;
  let maxTemp = -999;

  // Base climate parameters
  const baseTempC = 31.5;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const x0 = minX + i * cellWidth;
      const x1 = minX + (i + 1) * cellWidth;
      const y0 = minY + j * cellHeight;
      const y1 = minY + (j + 1) * cellHeight;

      // Radial heat island hotspot effect in the center + noise
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const distFromCenter = Math.sqrt(cx * cx + cy * cy) / (Math.max(width, height) / 2);
      const urbanHeatBias = Math.max(0, 1 - distFromCenter) * 6.5; // up to +6.5°C in core
      const microVariance = Math.sin(i * 1.3) * 1.8 + Math.cos(j * 1.7) * 1.5;

      const tileTempC = Number((baseTempC + urbanHeatBias + microVariance).toFixed(1));
      const tileTempF = celsiusToFahrenheit(tileTempC);

      sumTemp += tileTempC;
      if (tileTempC < minTemp) minTemp = tileTempC;
      if (tileTempC > maxTemp) maxTemp = tileTempC;

      // Geo coordinates
      const lng0 = lng + x0 / metersPerDegLng;
      const lng1 = lng + x1 / metersPerDegLng;
      const lat0 = lat + y0 / metersPerDegLat;
      const lat1 = lat + y1 / metersPerDegLat;

      features.push({
        type: "Feature",
        properties: {
          mean_temperature: tileTempF,
          min_temperature: celsiusToFahrenheit(tileTempC - 1.2),
          max_temperature: celsiusToFahrenheit(tileTempC + 1.8),
          mean_temperature_c: tileTempC,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [lng0, lat0],
              [lng1, lat0],
              [lng1, lat1],
              [lng0, lat1],
              [lng0, lat0],
            ],
          ],
        },
      });
    }
  }

  const meanTemp = Number((sumTemp / features.length).toFixed(1));

  const heatmap: FortyGuardHeatmapResult = {
    stats_data: {
      min: celsiusToFahrenheit(minTemp),
      max: celsiusToFahrenheit(maxTemp),
      mean: celsiusToFahrenheit(meanTemp),
      units: "fahrenheit",
      granularity: 60,
      analytic_type: "tcm",
      n_cells: features.length,
    },
    geojson: {
      type: "FeatureCollection",
      features,
    },
  };

  const envParams: FortyGuardEnvParamsResult = {
    heat_index_celsius: Number((meanTemp + 3.2).toFixed(1)),
    apparent_temperature_celsius: Number((meanTemp + 2.8).toFixed(1)),
    wet_bulb_temperature_celsius: 24.6, // safe < 28°C, caution > 29°C, critical > 31°C
    relative_humidity_percent: 48,
    precipitation_mm: 0.0,
    cloud_cover_octas: 1,
    solar_irradiance: 890, // W/m²
    elevation: 45,
    "air_quality:idx": 44, // Good AQI (< 50)
    "air_quality_pm2p5:idx": 11.2,
    "air_quality_pm10:idx": 22.4,
    "air_quality_no2:idx": 14.8,
    "air_quality_o3:idx": 38.0,
    co2_ppm: 418,
    methane_ppb: 1910,
  };

  return {
    projectId,
    projectName: "Forma Urban Site",
    location: { lat, lng },
    bbox,
    date: new Date().toISOString().split("T")[0],
    source: "mock",
    heatmap,
    envParams,
    fetchedAt: Date.now(),
  };
}
