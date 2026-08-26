import { OperationMode } from "../services/fortyguardService";

interface ModeSwitchProps {
  mode: OperationMode;
  onToggleMode: (newMode: OperationMode) => void;
  notice?: string;
}

export default function ModeSwitch({ mode, onToggleMode, notice }: ModeSwitchProps) {
  const isMock = mode === "mock";

  return (
    <div class="mode-switch-card">
      <div class="mode-switch-header">
        <div class="mode-title-group">
          <span class="mode-icon">{isMock ? "🛡️" : "⚡"}</span>
          <div>
            <div class="mode-label">
              {isMock ? "Demo / Mock Mode" : "Live FortyGuard API"}
            </div>
            <div class="mode-sublabel">
              {isMock ? "Zero API Credits Used (Cached & Procedural)" : "Connecting to api.fortyguard.com"}
            </div>
          </div>
        </div>

        <button
          type="button"
          class={`mode-toggle-btn ${isMock ? "btn-mock" : "btn-live"}`}
          onClick={() => onToggleMode(isMock ? "live" : "mock")}
          title="Click to switch between Demo mode and Live FortyGuard API"
        >
          {isMock ? "Switch to Live" : "Switch to Mock"}
        </button>
      </div>

      {notice && (
        <div class={`mode-notice ${isMock ? "notice-mock" : "notice-live"}`}>
          ℹ️ {notice}
        </div>
      )}
    </div>
  );
}
