import { useState } from "preact/hooks";

interface ComparisonViewProps {
  baselineTempC: number;
}

export default function ComparisonView({ baselineTempC }: ComparisonViewProps) {
  const [optionName, setOptionName] = useState("Proposal B (Shaded & High-Albedo)");
  const [hasCoolRoofs, setHasCoolRoofs] = useState(true);
  const [hasCanopyGreening, setHasCanopyGreening] = useState(true);
  const [hasEastWestOrientation, setHasEastWestOrientation] = useState(true);

  // Compute cooling delta based on interventions
  let coolingDelta = 0;
  if (hasCoolRoofs) coolingDelta += 2.4;
  if (hasCanopyGreening) coolingDelta += 3.1;
  if (hasEastWestOrientation) coolingDelta += 1.8;

  const modifiedTempC = Number((baselineTempC - coolingDelta).toFixed(1));
  const reductionPercent = Math.round((coolingDelta / baselineTempC) * 100);

  return (
    <div class="comparison-card">
      <div class="comparison-header">
        <div class="comparison-title">
          <span>⚖️</span> Design Option Heat Exposure Comparison
        </div>
        <span class="badge-blue">Track 1 Twin Simulation</span>
      </div>

      <p class="comparison-desc">
        Evaluate how architectural massing, tree canopy additions, and cool roof specifications reduce heat exposure compared to the baseline design.
      </p>

      {/* Comparison Metrics Grid */}
      <div class="comparison-grid">
        <div class="comp-col comp-baseline">
          <div class="comp-col-header">Option A: Baseline Design</div>
          <div class="comp-temp text-red">{baselineTempC.toFixed(1)}°C</div>
          <div class="comp-sub">Unmitigated Heat Load</div>
        </div>

        <div class="comp-col comp-option">
          <input
            type="text"
            class="comp-option-input"
            value={optionName}
            onInput={(e) => setOptionName((e.target as HTMLInputElement).value)}
            title="Edit proposal option name"
          />
          <div class="comp-temp text-green">{modifiedTempC.toFixed(1)}°C</div>
          <div class="comp-sub">Optimized Microclimate</div>
        </div>
      </div>

      {/* Big Success Metric: Heat Exposure Reduction % */}
      <div class="reduction-banner">
        <div class="reduction-label">Projected Heat Exposure Reduction:</div>
        <div class="reduction-value">🎉 -{reductionPercent}% (-{coolingDelta.toFixed(1)}°C)</div>
      </div>

      {/* Intervention Toggles */}
      <div class="intervention-toggles">
        <div class="intervention-title">Test Design Interventions:</div>

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={hasCoolRoofs}
            onChange={(e) => setHasCoolRoofs((e.target as HTMLInputElement).checked)}
          />
          <span class="toggle-text">High-Albedo Cool Roof Membranes (SRI &gt; 82) (-2.4°C)</span>
        </label>

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={hasCanopyGreening}
            onChange={(e) => setHasCanopyGreening((e.target as HTMLInputElement).checked)}
          />
          <span class="toggle-text">Deciduous Tree Canopy & Courtyard Shading (-3.1°C)</span>
        </label>

        <label class="toggle-row">
          <input
            type="checkbox"
            checked={hasEastWestOrientation}
            onChange={(e) => setHasEastWestOrientation((e.target as HTMLInputElement).checked)}
          />
          <span class="toggle-text">Optimized East-West Building Orientation & Breezeways (-1.8°C)</span>
        </label>
      </div>
    </div>
  );
}
