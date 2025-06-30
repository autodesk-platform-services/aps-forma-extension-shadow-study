import _ from "lodash";

interface TimeSelectorProps {
  isSingleTime: boolean;
  setIsSingleTime: (isSingleTime: boolean) => void;
  singleHour: number;
  setSingleHour: (hour: number) => void;
  singleMinute: number;
  setSingleMinute: (minute: number) => void;
  startHour: number;
  setStartHour: (startHour: number) => void;
  startMinute: number;
  setStartMinute: (startMinute: number) => void;
  endHour: number;
  setEndHour: (endHour: number) => void;
  endMinute: number;
  setEndMinute: (endMinute: number) => void;
  interval: number;
  setInterval: (interval: number) => void;
}

export default function TimeSelector({
  isSingleTime,
  setIsSingleTime,
  singleHour,
  setSingleHour,
  singleMinute,
  setSingleMinute,
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  endHour,
  setEndHour,
  endMinute,
  setEndMinute,
  interval,
  setInterval,
}: TimeSelectorProps) {
  return (
    <div class="section">
      <div class="section-title">Time</div>
      <div class="section-content" style={{ marginBottom: "10px" }}>
        <weave-button
          variant={isSingleTime ? "solid" : "outlined"}
          onClick={() => setIsSingleTime(true)}
          style={{ width: "70px" }}
        >
          Specific
        </weave-button>
        <weave-button
          variant={isSingleTime ? "outlined" : "solid"}
          onClick={() => setIsSingleTime(false)}
          style={{ width: "70px", marginLeft: "5px" }}
        >
          Range
        </weave-button>
      </div>

      {isSingleTime ? (
        <div class="section-content">
          <span class="row-title" style={{ width: "40px" }}>
            Time
          </span>
          <weave-select
            value={singleHour}
            onChange={(event) => setSingleHour(parseInt((event as CustomEvent).detail.value, 10))}
            style={{ width: "70px" }}
          >
            {_.range(0, 24).map((value) => (
              <weave-select-option value={value}>
                {value.toString().padStart(2, "0")}
              </weave-select-option>
            ))}
          </weave-select>
          <weave-select
            value={singleMinute}
            onChange={(event) => setSingleMinute(parseInt((event as CustomEvent).detail.value, 10))}
            class="right-aligned-select"
          >
            {_.range(0, 60, 15).map((value) => (
              <weave-select-option value={value}>
                {value.toString().padStart(2, "0")}
              </weave-select-option>
            ))}
          </weave-select>
        </div>
      ) : (
        <>
          <div class="section-content">
            <span class="row-title" style={{ width: "40px" }}>
              From
            </span>
            <weave-select
              value={startHour}
              onChange={(event) => setStartHour(parseInt((event as CustomEvent).detail.value, 10))}
              style={{ width: "70px" }}
            >
              {_.range(0, 24).map((value) => (
                <weave-select-option value={value}>
                  {value.toString().padStart(2, "0")}
                </weave-select-option>
              ))}
            </weave-select>
            <weave-select
              value={startMinute}
              onChange={(event) =>
                setStartMinute(parseInt((event as CustomEvent).detail.value, 10))
              }
              class="right-aligned-select"
            >
              {_.range(0, 60, 15).map((value) => (
                <weave-select-option value={value}>
                  {value.toString().padStart(2, "0")}
                </weave-select-option>
              ))}
            </weave-select>
          </div>

          <div class="section-content">
            <span class="row-title" style={{ width: "40px" }}>
              To
            </span>
            <weave-select
              value={endHour}
              onChange={(event) => setEndHour(parseInt((event as CustomEvent).detail.value, 10))}
              style={{ width: "70px" }}
            >
              {_.range(0, 24).map((value) => (
                <weave-select-option value={value}>
                  {value.toString().padStart(2, "0")}
                </weave-select-option>
              ))}
            </weave-select>
            <weave-select
              value={endMinute}
              onChange={(event) => setEndMinute(parseInt((event as CustomEvent).detail.value, 10))}
              class="right-aligned-select"
            >
              {_.range(0, 60, 15).map((value) => (
                <weave-select-option value={value}>
                  {value.toString().padStart(2, "0")}
                </weave-select-option>
              ))}
            </weave-select>
          </div>

          <div class="section-content">
            <span class="row-title" style={{ width: "40px" }}>
              Every
            </span>
            <weave-select
              value={interval}
              onChange={(event) => setInterval(parseInt((event as CustomEvent).detail.value, 10))}
              style={{ width: "150px" }}
            >
              <weave-select-option value={5}>5 mins</weave-select-option>
              <weave-select-option value={10}>10 mins</weave-select-option>
              <weave-select-option value={15}>15 mins</weave-select-option>
              <weave-select-option value={30}>30 mins</weave-select-option>
              <weave-select-option value={60}>1 hour</weave-select-option>
              <weave-select-option value={120}>2 hours</weave-select-option>
            </weave-select>
          </div>
        </>
      )}
    </div>
  );
}
