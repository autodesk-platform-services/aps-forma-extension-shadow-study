import { useState } from "preact/hooks";
import { ParcelInspectionResult } from "../services/types";
import { FormaSceneService } from "../services/formaScene";

interface ParcelInspectorProps {
  baselineMeanC: number;
}

export default function ParcelInspector({ baselineMeanC }: ParcelInspectorProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [inspection, setInspection] = useState<ParcelInspectionResult | null>(null);

  const handleStartDrawing = async () => {
    setIsDrawing(true);
    try {
      const result = await FormaSceneService.inspectDrawnParcel(baselineMeanC);
      if (result) {
        setInspection(result);
      }
    } finally {
      setIsDrawing(false);
    }
  };

  const getRiskBadgeClass = (risk: ParcelInspectionResult["riskCategory"]) => {
    switch (risk) {
      case "Critical":
        return "badge-red";
      case "High":
        return "badge-orange";
      case "Moderate":
        return "badge-yellow";
      case "Low":
        return "badge-green";
    }
  };

  return (
    <div class="parcel-card">
      <div class="parcel-header">
        <div class="parcel-title">
          <span>📐</span> Parcel Microclimate Inspector
        </div>
        {inspection && (
          <button
            type="button"
            class="parcel-clear-btn"
            onClick={() => setInspection(null)}
          >
            Clear
          </button>
        )}
      </div>

      <div class="parcel-body">
        <p class="parcel-desc">
          Click below and draw a polygon in the Forma 3D canvas to evaluate microclimate heat exposure for a specific courtyard, parcel, or building footprint.
        </p>

        <button
          type="button"
          class={`draw-parcel-btn ${isDrawing ? "drawing-active" : ""}`}
          onClick={handleStartDrawing}
          disabled={isDrawing}
        >
          {isDrawing ? "✏️ Drawing in 3D Viewport... (Click in 3D to finish)" : "🎯 Draw & Inspect Parcel in 3D"}
        </button>

        {inspection && (
          <div class="inspection-results">
            <div class="result-header">
              <span class="parcel-area-tag">Area: {inspection.areaSqMeters.toLocaleString()} m²</span>
              <span class={`status-badge ${getRiskBadgeClass(inspection.riskCategory)}`}>
                {inspection.riskCategory} Heat Risk
              </span>
            </div>

            <div class="result-metrics-row">
              <div class="sub-metric">
                <span class="sub-label">Mean Temp</span>
                <span class="sub-val">{inspection.meanTemperatureC}°C</span>
              </div>
              <div class="sub-metric">
                <span class="sub-label">Peak Heat</span>
                <span class="sub-val text-red">{inspection.maxTemperatureC}°C</span>
              </div>
              <div class="sub-metric">
                <span class="sub-label">Cooling Target</span>
                <span class="sub-val text-blue">-{Math.max(0, inspection.coolingDeficit)}°C</span>
              </div>
            </div>

            <div class="recommendations-box">
              <div class="rec-title">🌿 Targeted Cooling Interventions:</div>
              <ul class="rec-list">
                {inspection.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
