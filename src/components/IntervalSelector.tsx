type IntervalSelectorProps = {
  interval: number;
  setInterval: (interval: number) => void;
};

export default function IntervalSelector({ interval, setInterval }: IntervalSelectorProps) {
  return (
    <div class="section">
      <div class="section-title">Interval</div>
      <div class="section-content">
        <weave-select
          value={interval}
          onChange={(event) => setInterval(parseInt((event as CustomEvent).detail.value, 10))}
          style={{ width: "100%" }}
        >
          <weave-select-option value={5}>5 mins</weave-select-option>
          <weave-select-option value={10}>10 mins</weave-select-option>
          <weave-select-option value={15}>15 mins</weave-select-option>
          <weave-select-option value={30}>30 mins</weave-select-option>
          <weave-select-option value={60}>1 hour</weave-select-option>
          <weave-select-option value={120}>2 hours</weave-select-option>
        </weave-select>
      </div>
    </div>
  );
}
