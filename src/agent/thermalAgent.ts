import {
  FortyGuardEnvParamsResult,
  FortyGuardHeatmapResult,
} from "../services/types";
import { fahrenheitToCelsius } from "../services/mockData";

export type DesignLever =
  | "orientation"
  | "spacing"
  | "shading_greening";

export interface ThermalAgentInput {
  heatmap: FortyGuardHeatmapResult;
  envParams: FortyGuardEnvParamsResult;
  userQuestion?: string;
  designOption?: {
    orientation?: string;
    spacing?: string;
    shading?: string;
  };
}

export interface ThermalFinding {
  metric: string;
  value: number | string;
  interpretation: string;
}

export interface ThermalRecommendation {
  lever: DesignLever;
  recommendation: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface ThermalAgentResult {
  question: string;
  summary: string;
  riskLevel: "low" | "moderate" | "high" | "critical";
  findings: ThermalFinding[];
  recommendations: ThermalRecommendation[];
  baseline: {
    meanTemperatureC: number;
    maxTemperatureC: number;
    minTemperatureC: number;
    heatExposureScore: number;
  };
}

/**
 * Convert the FortyGuard heatmap temperature values to Celsius.
 */
function getTemperatureStats(heatmap: FortyGuardHeatmapResult) {
  const stats = heatmap.stats_data;

  const meanRaw = stats.mean ?? 85;
  const maxRaw = stats.max ?? meanRaw;
  const minRaw = stats.min ?? meanRaw;

  const isFahrenheit = stats.units !== "celsius";

  return {
    meanC: isFahrenheit ? fahrenheitToCelsius(meanRaw) : meanRaw,
    maxC: isFahrenheit ? fahrenheitToCelsius(maxRaw) : maxRaw,
    minC: isFahrenheit ? fahrenheitToCelsius(minRaw) : minRaw,
  };
}

/**
 * Estimate a simple heat-exposure score from the available
 * FortyGuard temperature range.
 *
 * This is deliberately a transparent MVP metric.
 * It is NOT a medical risk score.
 */
function calculateHeatExposureScore(
  meanC: number,
  maxC: number,
  minC: number,
): number {
  const meanComponent = Math.max(0, Math.min(100, ((meanC - 20) / 20) * 100));

  const peakComponent = Math.max(
    0,
    Math.min(100, ((maxC - 25) / 20) * 100),
  );

  const variabilityComponent = Math.max(
    0,
    Math.min(100, ((maxC - minC) / 12) * 100),
  );

  return Number(
    (
      meanComponent * 0.5 +
      peakComponent * 0.35 +
      variabilityComponent * 0.15
    ).toFixed(1),
  );
}

function classifyRisk(score: number): ThermalAgentResult["riskLevel"] {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

/**
 * Extract relevant environmental information from FortyGuard.
 */
function analyseEnvironment(
  envParams: FortyGuardEnvParamsResult,
): ThermalFinding[] {
  const findings: ThermalFinding[] = [];

  const solar = envParams.solar_irradiance;
  if (typeof solar === "number") {
    findings.push({
      metric: "Solar irradiance",
      value: solar,
      interpretation:
        solar >= 600
          ? "High solar exposure may contribute significantly to surface and facade heating."
          : "Solar exposure is not exceptionally high for the analysed period.",
    });
  }

  const humidity = envParams.relative_humidity;
  if (typeof humidity === "number") {
    findings.push({
      metric: "Relative humidity",
      value: humidity,
      interpretation:
        humidity >= 60
          ? "Higher humidity can increase perceived heat stress."
          : "Humidity is relatively moderate.",
    });
  }

  const wetBulb = envParams.wet_bulb_temperature_celsius;
  if (typeof wetBulb === "number") {
    findings.push({
      metric: "Wet-bulb temperature",
      value: wetBulb,
      interpretation:
        wetBulb >= 27
          ? "Elevated wet-bulb temperature indicates increased heat-stress conditions."
          : "Wet-bulb temperature is below the elevated-risk range used by this MVP.",
    });
  }

  const heatIndex = envParams.heat_index_celsius;
  if (typeof heatIndex === "number") {
    findings.push({
      metric: "Heat index",
      value: heatIndex,
      interpretation:
        heatIndex >= 32
          ? "The apparent thermal load is elevated."
          : "The apparent thermal load is comparatively moderate.",
    });
  }

  return findings;
}

/**
 * Select design interventions based on the evidence available.
 *
 * This is the agent's first decision layer.
 * Later, an LLM can reason over the same structured evidence.
 */
function selectRecommendations(
  meanC: number,
  maxC: number,
  envFindings: ThermalFinding[],
): ThermalRecommendation[] {
  const recommendations: ThermalRecommendation[] = [];

  const solarFinding = envFindings.find(
    (finding) => finding.metric === "Solar irradiance",
  );

  const solar =
    typeof solarFinding?.value === "number" ? solarFinding.value : 0;

  if (maxC >= 35 || meanC >= 30) {
    recommendations.push({
      lever: "shading_greening",
      recommendation:
        "Prioritize shading and vegetation around the most heat-exposed parts of the residential development.",
      reason:
        "The thermal baseline indicates elevated heat exposure, so reducing direct solar loading should be considered first.",
      priority: "high",
    });
  }

  if (solar >= 600) {
    recommendations.push({
      lever: "orientation",
      recommendation:
        "Compare alternative building orientations to reduce excessive direct solar exposure on major facades.",
      reason:
        "The site shows elevated solar irradiance, making building orientation a relevant design variable to investigate.",
      priority: "high",
    });
  }

  if (maxC - meanC >= 5) {
    recommendations.push({
      lever: "spacing",
      recommendation:
        "Compare alternative building spacing and massing arrangements to reduce localized heat concentration.",
      reason:
        "The temperature range indicates meaningful spatial variation across the analysed area.",
      priority: "medium",
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      lever: "shading_greening",
      recommendation:
        "Maintain the current design as a baseline and test targeted shading or vegetation as a low-risk improvement.",
      reason:
        "The available thermal indicators do not currently show severe heat exposure.",
      priority: "low",
    });
  }

  return recommendations;
}

/**
 * Main Thermal AI Agent.
 *
 * Current version:
 * FortyGuard data
 *      ↓
 * thermal analysis
 *      ↓
 * evidence extraction
 *      ↓
 * intervention selection
 *
 * Later:
 * FortyGuard data
 *      ↓
 * tool selection
 *      ↓
 * LLM reasoning
 *      ↓
 * intervention comparison
 *      ↓
 * recommendation
 */
export async function runThermalAgent(
  input: ThermalAgentInput,
): Promise<ThermalAgentResult> {
  const question =
    input.userQuestion ||
    "How can this residential design reduce resident heat exposure?";

  const { meanC, maxC, minC } = getTemperatureStats(input.heatmap);

  const heatExposureScore = calculateHeatExposureScore(
    meanC,
    maxC,
    minC,
  );

  const riskLevel = classifyRisk(heatExposureScore);

  const environmentalFindings = analyseEnvironment(input.envParams);

  const temperatureFindings: ThermalFinding[] = [
    {
      metric: "Mean temperature",
      value: Number(meanC.toFixed(1)),
      interpretation:
        "Represents the average thermal condition across the analysed area.",
    },
    {
      metric: "Maximum temperature",
      value: Number(maxC.toFixed(1)),
      interpretation:
        "Represents the hottest measured/predicted part of the analysed area.",
    },
    {
      metric: "Minimum temperature",
      value: Number(minC.toFixed(1)),
      interpretation:
        "Represents the coolest measured/predicted part of the analysed area.",
    },
    {
      metric: "Temperature range",
      value: Number((maxC - minC).toFixed(1)),
      interpretation:
        "A larger range indicates stronger spatial differences in thermal conditions.",
    },
    {
      metric: "Heat exposure score",
      value: heatExposureScore,
      interpretation:
        "Transparent MVP score derived from mean temperature, peak temperature and spatial variation.",
    },
  ];

  const findings = [
    ...temperatureFindings,
    ...environmentalFindings,
  ];

  const recommendations = selectRecommendations(
    meanC,
    maxC,
    environmentalFindings,
  );

  const summary =
    riskLevel === "critical"
      ? "The analysed residential site shows critical heat exposure. Design interventions should be prioritised."
      : riskLevel === "high"
        ? "The analysed residential site shows high heat exposure. Design changes should be investigated."
        : riskLevel === "moderate"
          ? "The analysed residential site shows moderate heat exposure. Targeted design improvements may reduce exposure."
          : "The analysed residential site currently shows relatively low heat exposure.";

  return {
    question,
    summary,
    riskLevel,
    findings,
    recommendations,
    baseline: {
      meanTemperatureC: Number(meanC.toFixed(1)),
      maxTemperatureC: Number(maxC.toFixed(1)),
      minTemperatureC: Number(minC.toFixed(1)),
      heatExposureScore,
    },
  };
}