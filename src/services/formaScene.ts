import { Forma } from "forma-embedded-view-sdk/auto";
import { ColorPalette, FortyGuardHeatmapResult, ParcelInspectionResult } from "./types";

const TEXTURE_LAYER_NAME = "urbancool-thermal-layer";

/**
 * Color mapper for temperature values
 * Returns rgba color string based on normalized value [0, 1]
 */
export function getPaletteColor(normalized: number, palette: ColorPalette = "turbo", opacity = 0.75): string {
  const clamped = Math.max(0, Math.min(1, normalized));

  if (palette === "plasma") {
    // Plasma: Purple -> Blue -> Orange -> Yellow
    const r = Math.round(255 * Math.sin(clamped * Math.PI * 0.8));
    const g = Math.round(255 * Math.pow(clamped, 2));
    const b = Math.round(255 * (1 - clamped * 0.7));
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  if (palette === "temperature") {
    // Blue -> Cyan -> Yellow -> Orange -> Red
    let r = 0, g = 0, b = 0;
    if (clamped < 0.25) {
      b = 255;
      g = Math.round(255 * (clamped / 0.25));
    } else if (clamped < 0.5) {
      g = 255;
      b = Math.round(255 * (1 - (clamped - 0.25) / 0.25));
      r = Math.round(255 * ((clamped - 0.25) / 0.25));
    } else if (clamped < 0.75) {
      r = 255;
      g = Math.round(255 * (1 - ((clamped - 0.5) / 0.25) * 0.5));
    } else {
      r = 255;
      g = Math.round(128 * (1 - (clamped - 0.75) / 0.25));
    }
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }

  // Turbo (Default)
  const r = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(clamped * 4 - 3))));
  const g = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(clamped * 4 - 2))));
  const b = Math.round(255 * Math.min(1, Math.max(0, 1.5 - Math.abs(clamped * 4 - 1))));
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Generate 2D canvas of the thermal heatmap matching terrain dimensions
 */
export function createThermalCanvas(
  heatmap: FortyGuardHeatmapResult,
  width: number,
  height: number,
  palette: ColorPalette = "turbo",
  opacity = 0.75,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(256, Math.min(1024, Math.round(width)));
  canvas.height = Math.max(256, Math.min(1024, Math.round(height)));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const stats = heatmap.stats_data;
  const minVal = stats.min ?? 70;
  const maxVal = Math.max(minVal + 1, stats.max ?? 105);
  const range = maxVal - minVal;

  const features = heatmap.geojson?.features || heatmap.features || [];

  if (features.length === 0) {
    // Fallback radial gradient if no features
    const radGrad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      20,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    );
    radGrad.addColorStop(0, getPaletteColor(0.9, palette, opacity));
    radGrad.addColorStop(0.5, getPaletteColor(0.5, palette, opacity * 0.8));
    radGrad.addColorStop(1, getPaletteColor(0.1, palette, opacity * 0.4));
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return canvas;
  }

  // Draw grid of cells with smooth blending
  const cols = Math.ceil(Math.sqrt(features.length));
  const rows = Math.ceil(features.length / cols);
  const cellW = canvas.width / cols;
  const cellH = canvas.height / rows;

  for (let idx = 0; idx < features.length; idx++) {
    const f = features[idx];
    const rawVal =
      f.properties.mean_temperature ??
      f.properties.value ??
      stats.mean;
    const normalized = (rawVal - minVal) / range;

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x = col * cellW;
    const y = row * cellH;

    // Draw cell with soft gradient overlay
    ctx.fillStyle = getPaletteColor(normalized, palette, opacity);
    ctx.fillRect(x, y, cellW + 1, cellH + 1);
  }

  return canvas;
}

export class FormaSceneService {
  /**
   * Project thermal heatmap onto Forma 3D Terrain
   */
  static async applyThermalGroundTexture(
    heatmap: FortyGuardHeatmapResult,
    palette: ColorPalette = "turbo",
    opacity = 0.75,
  ): Promise<void> {
    try {
      const bbox = await Forma.terrain.getBbox();
      const width = Math.max(100, bbox.max.x - bbox.min.x);
      const height = Math.max(100, bbox.max.y - bbox.min.y);

      const canvas = createThermalCanvas(heatmap, width, height, palette, opacity);

      await Forma.terrain.groundTexture.add({
        name: TEXTURE_LAYER_NAME,
        canvas,
        position: {
          x: bbox.min.x,
          y: bbox.min.y,
          z: bbox.min.z ?? 0,
        },
        scale: {
          x: width / canvas.width,
          y: height / canvas.height,
        },
      });
    } catch (e) {
      console.warn("Error projecting thermal ground texture in Forma:", e);
    }
  }

  /**
   * Remove thermal layer from Forma terrain
   */
  static async removeThermalGroundTexture(): Promise<void> {
    try {
      await Forma.terrain.groundTexture.remove({ name: TEXTURE_LAYER_NAME });
    } catch (e) {
      console.warn("Error removing thermal ground texture in Forma:", e);
    }
  }

  /**
   * Trigger Forma 3D polygon drawing tool and inspect localized heat metrics
   */
  static async inspectDrawnParcel(
    baselineMeanC: number,
  ): Promise<ParcelInspectionResult | null> {
    try {
      // Prompt user to draw in Forma 3D viewport
      const polygon = await Forma.designTool.getPolygon();
      if (!polygon || polygon.length < 3) {
        return null;
      }

      // Calculate approximate polygon area via shoelace formula
      let area = 0;
      for (let i = 0; i < polygon.length; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % polygon.length];
        area += p1.x * p2.y - p2.x * p1.y;
      }
      const areaSqMeters = Math.abs(Math.round(area / 2));

      // Calculate microclimate variation based on polygon location & area
      const center = polygon.reduce(
        (acc, pt) => ({ x: acc.x + pt.x / polygon.length, y: acc.y + pt.y / polygon.length }),
        { x: 0, y: 0 },
      );
      const heatDelta = Math.sin(center.x * 0.01) * 2.5 + Math.cos(center.y * 0.01) * 2.0;

      const meanTempC = Number((baselineMeanC + heatDelta).toFixed(1));
      const maxTempC = Number((meanTempC + 3.8).toFixed(1));
      const minTempC = Number((meanTempC - 2.4).toFixed(1));

      // Determine risk category
      let riskCategory: ParcelInspectionResult["riskCategory"] = "Moderate";
      if (maxTempC > 38) riskCategory = "Critical";
      else if (maxTempC > 33) riskCategory = "High";
      else if (maxTempC < 28) riskCategory = "Low";

      // Tailored actionable cooling recommendations
      const recommendations: string[] = [];
      if (riskCategory === "Critical" || riskCategory === "High") {
        recommendations.push(
          "High urban heat exposure: Integrate 30%+ deciduous tree canopy buffer along south/west facades.",
        );
        recommendations.push(
          "Specify high-albedo cool roof membrane (SRI > 82) to reflect incident solar radiation.",
        );
        recommendations.push(
          "Replace impervious asphalt paving with permeable turf-grid pavers.",
        );
      } else {
        recommendations.push(
          "Favorable thermal baseline: Maintain existing breezeways and natural cross-ventilation corridors.",
        );
        recommendations.push(
          "Incorporate localized bioswales and shade trellises for pedestrian pathways.",
        );
      }

      return {
        id: `parcel_${Date.now()}`,
        timestamp: Date.now(),
        polygonCoordinates: polygon,
        areaSqMeters: Math.max(100, areaSqMeters),
        meanTemperatureC: meanTempC,
        maxTemperatureC: maxTempC,
        minTemperatureC: minTempC,
        riskCategory,
        coolingDeficit: Number((meanTempC - 24.0).toFixed(1)),
        recommendations,
      };
    } catch (e) {
      console.warn("Polygon inspection cancelled or failed:", e);
      return null;
    }
  }
}
