import { ColorPalette } from "../services/types";

interface ThermalLayerControlsProps {
  isVisible: boolean;
  onToggleVisibility: (visible: boolean) => void;
  opacity: number;
  onChangeOpacity: (opacity: number) => void;
  palette: ColorPalette;
  onChangePalette: (palette: ColorPalette) => void;
  minLabel: string;
  maxLabel: string;
}

export default function ThermalLayerControls({
  isVisible,
  onToggleVisibility,
  opacity,
  onChangeOpacity,
  palette,
  onChangePalette,
  minLabel,
  maxLabel,
}: ThermalLayerControlsProps) {
  return (
    <div class="controls-card">
      <div class="controls-header">
        <div class="controls-title">
          <span>🗺️</span> 3D Terrain Heatmap Layer
        </div>
        <label class="switch-container">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => onToggleVisibility((e.target as HTMLInputElement).checked)}
          />
          <span class="switch-slider"></span>
        </label>
      </div>

      {isVisible && (
        <div class="controls-body">
          {/* Opacity Control */}
          <div class="control-row">
            <label class="control-label">Layer Opacity ({Math.round(opacity * 100)}%):</label>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={opacity}
              class="range-slider"
              onInput={(e) => onChangeOpacity(parseFloat((e.target as HTMLInputElement).value))}
            />
          </div>

          {/* Palette Selector */}
          <div class="control-row">
            <label class="control-label">Color Scheme:</label>
            <div class="palette-buttons">
              {(["turbo", "plasma", "temperature"] as ColorPalette[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  class={`palette-btn ${palette === p ? "palette-active" : ""}`}
                  onClick={() => onChangePalette(p)}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Heatmap Legend Gradient */}
          <div class="legend-container">
            <div class="legend-bar" data-palette={palette}></div>
            <div class="legend-labels">
              <span>Cooler ({minLabel})</span>
              <span>Hotspot ({maxLabel})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
