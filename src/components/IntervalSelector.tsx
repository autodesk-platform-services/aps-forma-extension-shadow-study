type IntervalSelectorProps = {
  interval: number;
  setInterval: (interval: number) => void;
};

export default function IntervalSelector(props: IntervalSelectorProps) {
  const { interval, setInterval } = props;
  return (
    <div class="row">
      <div class="row-title">Frequency</div>
      <div class="row-item">
        <weave-select
          value={interval}
          onChange={(event) => setInterval(parseInt((event as CustomEvent).detail.value, 10))}
        >
          <weave-select-option value="5">Every 5th minute</weave-select-option>
          <weave-select-option value="15">Every 15th minute</weave-select-option>
          <weave-select-option value="30">Every 30th minute</weave-select-option>
          <weave-select-option value="60">Every hour</weave-select-option>
          <weave-select-option value="120">Every 2nd hour</weave-select-option>
        </weave-select>
      </div>
    </div>
  );
}
