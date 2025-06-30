import { Forma } from "forma-embedded-view-sdk/auto";
import { DateTime } from "luxon";
import { useState } from "preact/hooks";
import { Fragment } from "preact";
import { MONTHS } from "../constants";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface DateEntry {
  month: number;
  day: number;
}

interface Props {
  isSingleTime: boolean;
  singleHour: number;
  singleMinute: number;
  defaultDateIndex?: number;
  dates: DateEntry[];
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  interval: number;
}

export default function PreviewButton({
  isSingleTime,
  singleHour,
  singleMinute,
  defaultDateIndex = -1,
  dates,
  startHour,
  startMinute,
  endHour,
  endMinute,
  interval,
}: Props) {
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(defaultDateIndex);

  const onClickPreview = async () => {
    if (selectedDateIndex === -1 || !dates[selectedDateIndex]) {
      alert("Please select a date to preview");
      return;
    }

    try {
      const selectedDate = dates[selectedDateIndex];
      const projectTimezone = await Forma.project.getTimezone();
      if (!projectTimezone) {
        throw new Error("Unable to access project timezone");
      }
      const originalDate = await Forma.sun.getDate();
      const year = originalDate.getFullYear();

      if (isSingleTime) {
        // Set single time
        const date = DateTime.fromObject(
          {
            year,
            month: selectedDate.month,
            day: selectedDate.day,
            hour: singleHour,
            minute: singleMinute,
          },
          { zone: projectTimezone },
        );
        await Forma.sun.setDate({ date: date.toJSDate() });
      } else {
        // Animate through time range
        let current = DateTime.fromObject(
          {
            year,
            month: selectedDate.month,
            day: selectedDate.day,
            hour: startHour,
            minute: startMinute,
          },
          { zone: projectTimezone },
        );
        const end = DateTime.fromObject(
          {
            year,
            month: selectedDate.month,
            day: selectedDate.day,
            hour: endHour,
            minute: endMinute,
          },
          { zone: projectTimezone },
        );

        while (current.toMillis() <= end.toMillis()) {
          await Forma.sun.setDate({ date: current.toJSDate() });
          current = current.plus({ minutes: interval });
          await timeout(500);
        }
        await Forma.sun.setDate({ date: originalDate });
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="section">
      <div class="section-title">Preview</div>
      <div class="section-content">
        <weave-select
          value={selectedDateIndex}
          onChange={(event) => setSelectedDateIndex(parseInt((event as CustomEvent).detail.value, 10))}
          style={{ width: "100%" }}
        >
          <weave-select-option value={-1}>Select date...</weave-select-option>
          <Fragment>
            {dates.map((date, index) => (
              <weave-select-option key={index} value={index}>
                {`${new Date(new Date().getFullYear(), date.month - 1, date.day).toLocaleString(undefined, { month: 'long' })} ${date.day}`}
              </weave-select-option>
            ))}
          </Fragment>
        </weave-select>
      </div>
      <div class="section-content" style={{ marginTop: "5px" }}>
        <weave-button 
          variant="outlined" 
          onClick={onClickPreview} 
          data-disabled={selectedDateIndex === -1 ? "" : undefined}
        >
          {isSingleTime ? "Preview time" : "Preview animation"}
        </weave-button>
      </div>
    </div>
  );
}
