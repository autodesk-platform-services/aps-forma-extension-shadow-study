import _ from "lodash";

type DateSelectorProps = {
  month: number;
  setMonth: (month: number) => void;
  day: number;
  setDay: (day: number) => void;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export default function DateSelector(props: DateSelectorProps) {
  const { month, setMonth, day, setDay } = props;

  return (
    <div class="row">
      <div class="row-title">Date</div>
      <div class="row-item">
        <weave-select
          value={month}
          onChange={(event) => setMonth(parseInt((event as CustomEvent).detail.value, 10))}
        >
          {/* // Luxon uses 1-indexed months, so we need to add 1 to the value */}
          {MONTHS.map((name, value) => (
            <weave-select-option value={value + 1}>{name}</weave-select-option>
          ))}
        </weave-select>
        <weave-select
          value={day}
          onChange={(event) => setDay(parseInt((event as CustomEvent).detail.value, 10))}
          style={{ width: "50px", marginLeft: "5px" }}
        >
          {_.range(1, 31).map((value) => (
            <weave-select-option value={value}>{value.toString()}</weave-select-option>
          ))}
        </weave-select>
      </div>
    </div>
  );
}
