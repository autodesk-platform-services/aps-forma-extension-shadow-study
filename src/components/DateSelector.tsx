import _ from "lodash";

interface DateEntry {
  month: number;
  day: number;
}

interface Props {
  year: number;
  month: number;
  setMonth: (month: number) => void;
  day: number;
  setDay: (day: number) => void;
  dates: DateEntry[];
  onAddDate: (month: number, day: number) => void;
  onRemoveDate: (index: number) => void;
}

export default function DateSelector({
  year,
  month,
  setMonth,
  day,
  setDay,
  dates,
  onAddDate,
  onRemoveDate,
}: Props) {
  return (
    <div class="section">
      <div class="section-title">Date</div>
      <div class="section-content">
        <weave-select
          value={month}
          onChange={(event) => setMonth(parseInt((event as CustomEvent).detail.value, 10))}
          style={{ width: "115px" }}
        >
          {_.range(1, 13).map((m) => (
            <weave-select-option key={m} value={m}>
              {new Date(year, m - 1).toLocaleString(undefined, { month: 'long' })}
            </weave-select-option>
          ))}
        </weave-select>
        <weave-select
          value={day}
          onChange={(event) => setDay(parseInt((event as CustomEvent).detail.value, 10))}
          class="right-aligned-select"
        >
          {_.range(1, 32).map((d) => (
            <weave-select-option key={d} value={d}>
              {d.toString()}
            </weave-select-option>
          ))}
        </weave-select>
      </div>
      <div class="section-content" style={{ marginTop: "5px" }}>
        <weave-button 
          variant="outlined" 
          onClick={() => onAddDate(month, day)}
          {...({ disabled: dates.some((d) => d.month === month && d.day === day) } as any)}
        >
          Add date
        </weave-button>
      </div>
      
      {dates.map((date, index) => (
        <div key={index} class="section-content" style={{ marginTop: "5px" }}>
          <span>{new Date(year, date.month - 1, date.day).toLocaleDateString()}</span>
          <weave-button 
            variant="flat" 
            onClick={() => onRemoveDate(index)} 
            style={{ minWidth: "24px", padding: "0", marginLeft: "auto" }}
          >
            ✕
          </weave-button>
        </div>
      ))}
    </div>
  );
}
