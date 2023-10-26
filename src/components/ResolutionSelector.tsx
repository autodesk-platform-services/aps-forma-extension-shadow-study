type ResolutionSelectorProps = {
  resolution: string;
  setResolution: (resolution: string) => void;
};

export default function ResolutionSelector(props: ResolutionSelectorProps) {
  const { resolution, setResolution } = props;
  return (
    <div class="row">
      <div class="row-title">Size</div>
      <div class="row-item">
        <weave-select
          value={resolution}
          onChange={(event) => setResolution((event as CustomEvent).detail.value)}
        >
          <weave-select-option value="512x384">Small (512x384)</weave-select-option>
          <weave-select-option value="1024x768">Medium (1024x768)</weave-select-option>
          <weave-select-option value="2048x1536">Large (2048x1536)</weave-select-option>
          <weave-select-option value="3840x2160">4K (3840x2160)</weave-select-option>
        </weave-select>
      </div>
    </div>
  );
}
