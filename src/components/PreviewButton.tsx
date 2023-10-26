import { Forma } from "forma-embedded-view-sdk/auto";
import { DateTime } from "luxon";

function timeout(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type PreviewButtonProps = {
  month: number;
  day: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  interval: number;
};

export default function PreviewButton(props: PreviewButtonProps) {
  const { month, day, startHour, startMinute, endHour, endMinute, interval } = props;

  const onClickPreview = async () => {
    try {
      const projectTimezone = await Forma.project.getTimezone();
      if (!projectTimezone) {
        throw new Error("Unable to access project timezone");
      }
      const originalDate = await Forma.sun.getDate();
      const year = originalDate.getFullYear();

      let current = DateTime.fromObject(
        {
          year,
          month,
          day,
          hour: startHour,
          minute: startMinute,
        },
        { zone: projectTimezone },
      );
      const end = DateTime.fromObject(
        {
          year,
          month,
          day,
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
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="row">
      <weave-button variant="outlined" onClick={onClickPreview}>
        Preview
      </weave-button>
    </div>
  );
}
