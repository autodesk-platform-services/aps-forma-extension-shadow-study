interface Props {
  resolution: string;
  setResolution: (resolution: string) => void;
}

export default function ResolutionSelector({ resolution, setResolution }: Props) {
  return (
    <div class="section-content" style={{ marginBottom: "10px" }}>
      <span class="row-title">Resolution</span>
      <div style={{ display: "flex", gap: "5px", marginLeft: "auto" }}>
        <weave-button
          variant={resolution === "512x384" ? "solid" : "outlined"}
          onClick={() => setResolution("512x384")}
          style={{ width: "24px", height: "24px", padding: "0" }}
          title="512 × 384"
        >
          S
        </weave-button>
        <weave-button
          variant={resolution === "1024x768" ? "solid" : "outlined"}
          onClick={() => setResolution("1024x768")}
          style={{ width: "24px", height: "24px", padding: "0" }}
          title="1024 × 768"
        >
          M
        </weave-button>
        <weave-button
          variant={resolution === "2048x1536" ? "solid" : "outlined"}
          onClick={() => setResolution("2048x1536")}
          style={{ width: "24px", height: "24px", padding: "0" }}
          title="2048 × 1536"
        >
          L
        </weave-button>
        <weave-button
          variant={resolution === "3840x2160" ? "solid" : "outlined"}
          onClick={() => setResolution("3840x2160")}
          style={{ width: "24px", height: "24px", padding: "0" }}
          title="3840 × 2160"
        >
          4K
        </weave-button>
      </div>
    </div>
  );
}
