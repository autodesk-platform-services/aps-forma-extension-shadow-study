import _ from "lodash";

const formatTime = (x: number) => (x < 10 ? "0" + x : x).toString();

type TimeSelectorProps = {
  startHour: number;
  setStartHour: (startHour: number) => void;
  startMinute: number;
  setStartMinute: (startMinute: number) => void;
  endHour: number;
  setEndHour: (endHour: number) => void;
  endMinute: number;
  setEndMinute: (endMinute: number) => void;
};

export default function TimeSelector(props: TimeSelectorProps) {
  const {
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
  } = props;

  return (
    <>
      <div class="row">
        <div class="row-title">Time</div>
        <div class="row-item">
          <div class="helpText">From</div>
          <weave-select
            value={startHour}
            onChange={(event) => setStartHour(parseInt((event as CustomEvent).detail.value, 10))}
            style={{ width: "50px", marginLeft: "10px" }}
          >
            {_.range(25).map((value) => (
              <weave-select-option value={value}>{formatTime(value)}</weave-select-option>
            ))}
          </weave-select>
          <weave-select
            value={startMinute}
            onChange={(event) => setStartMinute(parseInt((event as CustomEvent).detail.value, 10))}
            style={{ width: "50px", marginLeft: "5px" }}
          >
            {_.range(60).map((value) => (
              <weave-select-option value={value}>{formatTime(value)}</weave-select-option>
            ))}
          </weave-select>
        </div>
      </div>
      <div class="row">
        <div class="row-title"></div>
        <div class="row-item">
          <div class="helpText">To</div>
          <weave-select
            value={endHour}
            onChange={(event) => setEndHour(parseInt((event as CustomEvent).detail.value, 10))}
            style={{ width: "50px", marginLeft: "10px" }}
          >
            {_.range(25).map((value) => (
              <weave-select-option value={value}>{formatTime(value)}</weave-select-option>
            ))}
          </weave-select>
          <weave-select
            value={endMinute}
            onChange={(event) => setEndMinute(parseInt((event as CustomEvent).detail.value, 10))}
            style={{ width: "50px", marginLeft: "5px" }}
          >
            {_.range(60).map((value) => (
              <weave-select-option value={value}>{formatTime(value)}</weave-select-option>
            ))}
          </weave-select>
        </div>
      </div>
    </>
  );
}
