export type AnalyticType = "tcm" | "time_of_measure" | "exceedance" | "persistence";

export interface HeatmapStats {
  min: number;
  max: number;
  mean: number;
  units?: string;
  granularity?: number;
  analytic_type?: string;
  n_cells?: number;
}

export interface HeatmapTileProperties {
  min_temperature?: number;
  max_temperature?: number;
  mean_temperature?: number;
  value?: number;
  [key: string]: unknown;
}

export interface HeatmapTileFeature {
  type: "Feature";
  properties: HeatmapTileProperties;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
}

export interface FortyGuardHeatmapResult {
  stats_data: HeatmapStats;
  geojson?: {
    type: "FeatureCollection";
    features: HeatmapTileFeature[];
  };
  features?: HeatmapTileFeature[];
}

export interface FortyGuardEnvParamsResult {
  heat_index_celsius?: number;
  apparent_temperature_celsius?: number;
  wet_bulb_temperature_celsius?: number;
  relative_humidity_percent?: number;
  precipitation_mm?: number;
  cloud_cover_octas?: number;
  solar_irradiance?: number;
  elevation?: number;
  "air_quality:idx"?: number;
  "air_quality_pm2p5:idx"?: number;
  "air_quality_pm10:idx"?: number;
  "air_quality_no2:idx"?: number;
  "air_quality_o3:idx"?: number;
  "air_quality_so2:idx"?: number;
  co2_ppm?: number;
  methane_ppb?: number;
  aqi_us_co?: number;
  [key: string]: unknown;
}

export interface SiteThermalData {
  projectId: string;
  projectName?: string;
  location: {
    lat: number;
    lng: number;
  };
  bbox?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  date: string;
  source: "mock" | "live" | "cache";
  heatmap: FortyGuardHeatmapResult;
  envParams: FortyGuardEnvParamsResult;
  fetchedAt: number;
}

export interface ParcelInspectionResult {
  id: string;
  timestamp: number;
  polygonCoordinates: Array<{ x: number; y: number; z?: number }>;
  areaSqMeters: number;
  meanTemperatureC: number;
  maxTemperatureC: number;
  minTemperatureC: number;
  riskCategory: "Low" | "Moderate" | "High" | "Critical";
  coolingDeficit: number; // delta vs baseline comfort (25°C)
  recommendations: string[];
}

export type ColorPalette = "plasma" | "turbo" | "temperature" | "coolwarm";
