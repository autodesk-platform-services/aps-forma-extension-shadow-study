import { FortyGuardEnvParamsResult, FortyGuardHeatmapResult } from "../services/types";
import { fahrenheitToCelsius, celsiusToFahrenheit } from "../services/mockData";

interface ThermalMetricsCardProps {
  heatmap: FortyGuardHeatmapResult;
  envParams: FortyGuardEnvParamsResult;
  unit: "C" | "F";
  onToggleUnit: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function ThermalMetricsCard({
  heatmap,
  envParams,
  unit,
  onToggleUnit,
  onRefresh,
  isLoading,
}: ThermalMetricsCardProps) {
  // Convert units
  const rawMean = heatmap.stats_data.mean ?? 85;
  const rawMax = heatmap.stats_data.max ?? 98;
  const isRawFahrenheit = heatmap.stats_data.units !== "celsius";

  const meanC = isRawFahrenheit ? fahrenheitToCelsius(rawMean) : rawMean;
  const maxC = isRawFahrenheit ? fahrenheitToCelsius(rawMax) : rawMax;

  const displayMean = unit === "C" ? `${meanC}°C` : `${celsiusToFahrenheit(meanC)}°F`;
  const displayMax = unit === "C" ? `${maxC}°C` : `${celsiusToFahrenheit(maxC)}°F`;

  const heatIndexC = envParams.heat_index_celsius ?? meanC + 3.0;
  const displayHeatIndex =
    unit === "C" ? `${heatIndexC.toFixed(1)}°C` : `${celsiusToFahrenheit(heatIndexC)}°F`;

  const wetBulbC = envParams.wet_bulb_temperature_celsius ?? 24.5;
  const displayWetBulb =
    unit === "C" ? `${wetBulbC.toFixed(1)}°C` : `${celsiusToFahrenheit(wetBulbC)}°F`;

  // Wet-bulb safety rating
  let wetBulbStatus = { label: "Safe", className: "badge-green" };
  if (wetBulbC >= 29) {
    wetBulbStatus = { label: "Extreme Danger", className: "badge-red" };
  } else if (wetBulbC >= 27) {
    wetBulbStatus = { label: "Caution", className: "badge-yellow" };
  }

  const aqi = envParams["air_quality:idx"] ?? 42;
  const solarIrr = envParams.solar_irradiance ?? 850;

  return (
    <div class="metrics-card">
      <div class="metrics-header">
        <div class="metrics-title">
          <span>🌡️</span> Site Microclimate Intelligence
        </div>
        <div class="metrics-actions">
          <button
            type="button"
            class="unit-toggle-btn"
            onClick={onToggleUnit}
            title="Toggle between Celsius and Fahrenheit"
          >
            °{unit}
          </button>
          <button
            type="button"
            class="refresh-btn"
            onClick={onRefresh}
            disabled={isLoading}
            title="Refresh thermal scan"
          >
            {isLoading ? "⏳" : "🔄"}
          </button>
        </div>
      </div>

      <div class="metrics-grid">
        {/* Metric 1: Peak Surface Temp */}
        <div class="metric-tile metric-danger">
          <div class="metric-tile-title">Peak Surface Temp</div>
          <div class="metric-tile-val">{displayMax}</div>
          <div class="metric-tile-sub">Site Mean: {displayMean}</div>
        </div>

        {/* Metric 2: Feels Like / Heat Index */}
        <div class="metric-tile metric-warning">
          <div class="metric-tile-title">Heat Index (Feels Like)</div>
          <div class="metric-tile-val">{displayHeatIndex}</div>
          <div class="metric-tile-sub">Ambient RH: {envParams.relative_humidity_percent ?? 45}%</div>
        </div>

        {/* Metric 3: Wet-Bulb Safety */}
        <div class="metric-tile metric-info">
          <div class="metric-tile-title">
            Wet-Bulb Temp <span class={`status-badge ${wetBulbStatus.className}`}>{wetBulbStatus.label}</span>
          </div>
          <div class="metric-tile-val">{displayWetBulb}</div>
          <div class="metric-tile-sub">Outdoor threshold: &lt; 28°C</div>
        </div>

        {/* Metric 4: Solar Irradiance & AQI */}
        <div class="metric-tile metric-purple">
          <div class="metric-tile-title">Solar & Air Quality</div>
          <div class="metric-tile-val">{solarIrr} <span class="unit-sub">W/m²</span></div>
          <div class="metric-tile-sub">AQI Index: {aqi} (Good)</div>
        </div>
      </div>
    </div>
  );
}
