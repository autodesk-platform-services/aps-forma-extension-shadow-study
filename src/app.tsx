import { useState, useEffect } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { ColorPalette, SiteThermalData } from "./services/types";
import { FortyGuardService, OperationMode } from "./services/fortyguardService";
import { FormaSceneService } from "./services/formaScene";
import { fahrenheitToCelsius } from "./services/mockData";

// Components
import ModeSwitch from "./components/ModeSwitch";
import ThermalMetricsCard from "./components/ThermalMetricsCard";
import ThermalLayerControls from "./components/ThermalLayerControls";
import ParcelInspector from "./components/ParcelInspector";
import AiClimateCopilot from "./components/AiClimateCopilot";
import ComparisonView from "./components/ComparisonView";

// Legacy Shadow Study Components
import DateSelector from "./components/DateSelector";
import TimeSelector from "./components/TimeSelector";
import IntervalSelector from "./components/IntervalSelector";
import ResolutionSelector from "./components/ResolutionSelector";
import PreviewButton from "./components/PreviewButton";
import ExportButton from "./components/ExportButton";

type AppTab = "thermal" | "compare" | "copilot" | "shadows";

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>("thermal");
  const [mode, setMode] = useState<OperationMode>(FortyGuardService.getMode());
  const [notice, setNotice] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unit, setUnit] = useState<"C" | "F">("C");

  // Site Thermal Data State
  const [thermalData, setThermalData] = useState<SiteThermalData | null>(null);

  // 3D Layer Controls State
  const [isLayerVisible, setIsLayerVisible] = useState<boolean>(true);
  const [layerOpacity, setLayerOpacity] = useState<number>(0.75);
  const [layerPalette, setLayerPalette] = useState<ColorPalette>("turbo");

  // Shadow Study State
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(21);
  const [interval, setInterval] = useState(30);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(18);
  const [endMinute, setEndMinute] = useState(0);
  const [resolution, setResolution] = useState("2048x1536");

  // Load site thermal data from Forma
  const loadSiteData = async (forceRefresh = false, overrideMode?: OperationMode) => {
    setIsLoading(true);
    try {
      let lat = 37.3382;
      let lng = -121.8863;
      let projectId = "forma_project_default";

      try {
        const geo = await Forma.project.getGeoLocation();
        if (geo && Array.isArray(geo) && geo.length >= 2) {
          lat = geo[0] ?? lat;
          lng = geo[1] ?? lng;
        }
        const proj = await Forma.project.get();
        if (proj?.name) {
          projectId = `forma_${proj.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
        }
      } catch (e) {
        console.warn("Could not read Forma project info, using fallback location:", e);
      }

      let bbox;
      try {
        const tb = await Forma.terrain.getBbox();
        bbox = { minX: tb.min.x, minY: tb.min.y, maxX: tb.max.x, maxY: tb.max.y };
      } catch {
        bbox = { minX: -300, minY: -300, maxX: 300, maxY: 300 };
      }

      const res = await FortyGuardService.fetchThermalData({
        projectId,
        lat,
        lng,
        bbox,
        forceRefresh,
        overrideMode: overrideMode || mode,
      });

      setThermalData(res.data);
      setNotice(res.notice);

      // Auto-project onto Forma 3D terrain
      if (isLayerVisible) {
        await FormaSceneService.applyThermalGroundTexture(
          res.data.heatmap,
          layerPalette,
          layerOpacity,
        );
      }
    } catch (err) {
      console.error("Error loading thermal data:", err);
      setNotice(`Error: ${err instanceof Error ? err.message : "Failed to load data"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSiteData();
  }, []);

  // Update 3D layer on settings change
  useEffect(() => {
    if (!thermalData) return;
    if (isLayerVisible) {
      FormaSceneService.applyThermalGroundTexture(
        thermalData.heatmap,
        layerPalette,
        layerOpacity,
      );
    } else {
      FormaSceneService.removeThermalGroundTexture();
    }
  }, [isLayerVisible, layerPalette, layerOpacity, thermalData]);

  // Handle Mode Switch
  const handleToggleMode = (newMode: OperationMode) => {
    FortyGuardService.setMode(newMode);
    setMode(newMode);
    loadSiteData(true, newMode);
  };

  // Calculate baseline mean temp for parcel inspector & comparisons
  const rawMean = thermalData?.heatmap.stats_data.mean ?? 85;
  const isRawF = thermalData?.heatmap.stats_data.units !== "celsius";
  const baselineMeanC = isRawF ? fahrenheitToCelsius(rawMean) : rawMean;

  const minLabel =
    unit === "C"
      ? `${(baselineMeanC - 4.5).toFixed(1)}°C`
      : `${((baselineMeanC - 4.5) * 1.8 + 32).toFixed(1)}°F`;
  const maxLabel =
    unit === "C"
      ? `${(baselineMeanC + 6.8).toFixed(1)}°C`
      : `${((baselineMeanC + 6.8) * 1.8 + 32).toFixed(1)}°F`;

  return (
    <div class="urbancool-app">
      {/* App Header */}
      <header class="app-header">
        <div class="brand-row">
          <div class="brand-badge">⚡ FortyGuard × Autodesk Forma</div>
          <h1 class="app-title">UrbanCool 3D</h1>
          <div class="app-tagline">Microclimate Heat Risk & Mitigation Digital Twin</div>
        </div>

        {/* Navigation Tabs */}
        <nav class="app-tabs">
          <button
            type="button"
            class={`tab-btn ${activeTab === "thermal" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("thermal")}
          >
            🌐 3D Thermal Twin
          </button>
          <button
            type="button"
            class={`tab-btn ${activeTab === "compare" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("compare")}
          >
            ⚖️ Option Compare
          </button>
          <button
            type="button"
            class={`tab-btn ${activeTab === "copilot" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("copilot")}
          >
            🤖 AI Copilot
          </button>
          <button
            type="button"
            class={`tab-btn ${activeTab === "shadows" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("shadows")}
          >
            ☀️ Shadows
          </button>
        </nav>
      </header>

      {/* Main Tab Views */}
      <main class="app-content">
        {activeTab === "thermal" && (
          <>
            {/* Mode Switcher */}
            <ModeSwitch
              mode={mode}
              onToggleMode={handleToggleMode}
              notice={notice}
            />

            {/* Metrics Dashboard */}
            {thermalData && (
              <ThermalMetricsCard
                heatmap={thermalData.heatmap}
                envParams={thermalData.envParams}
                unit={unit}
                onToggleUnit={() => setUnit(unit === "C" ? "F" : "C")}
                onRefresh={() => loadSiteData(true)}
                isLoading={isLoading}
              />
            )}

            {/* 3D Terrain Layer Controls */}
            <ThermalLayerControls
              isVisible={isLayerVisible}
              onToggleVisibility={setIsLayerVisible}
              opacity={layerOpacity}
              onChangeOpacity={setLayerOpacity}
              palette={layerPalette}
              onChangePalette={setLayerPalette}
              minLabel={minLabel}
              maxLabel={maxLabel}
            />

            {/* Parcel Drawing Inspector */}
            <ParcelInspector baselineMeanC={baselineMeanC} />
          </>
        )}

        {activeTab === "compare" && (
          <ComparisonView baselineTempC={baselineMeanC} />
        )}

        {activeTab === "copilot" && thermalData && (
          <AiClimateCopilot
            heatmap={thermalData.heatmap}
            envParams={thermalData.envParams}
          />
        )}

        {activeTab === "shadows" && (
          <div class="shadow-study-panel">
            <div class="section-title">☀️ Sun & Shadow Sequence Analysis</div>
            <DateSelector month={month} setMonth={setMonth} day={day} setDay={setDay} />
            <TimeSelector
              startHour={startHour}
              startMinute={startMinute}
              endHour={endHour}
              endMinute={endMinute}
              setStartHour={setStartHour}
              setStartMinute={setStartMinute}
              setEndHour={setEndHour}
              setEndMinute={setEndMinute}
            />
            <IntervalSelector interval={interval} setInterval={setInterval} />
            <ResolutionSelector resolution={resolution} setResolution={setResolution} />
            <div class="shadow-actions">
              <PreviewButton
                month={month}
                day={day}
                startHour={startHour}
                startMinute={startMinute}
                endHour={endHour}
                endMinute={endMinute}
                interval={interval}
              />
              <ExportButton
                month={month}
                day={day}
                startHour={startHour}
                startMinute={startMinute}
                endHour={endHour}
                endMinute={endMinute}
                resolution={resolution}
                interval={interval}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer class="app-footer">
        FortyGuard Hackathon • Track 1 Digital Twin • Team Berlin
      </footer>
    </div>
  );
}
