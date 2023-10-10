import { Forma } from "forma-embedded-view-sdk/auto";
import { SecondaryButton, Row } from "../styles";
import { getTimezoneOffset } from "../utils";

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
      const currentDate = await Forma.sun.getDate();
      const offsetMs = getTimezoneOffset(currentDate, projectTimezone);
      const year = currentDate.getFullYear();
      const startDate = new Date(year, month, day, startHour, startMinute, 0, offsetMs);
      const endDate = new Date(year, month, day, endHour, endMinute, 0, offsetMs);

      while (startDate.getTime() <= endDate.getTime()) {
        await Forma.sun.setDate({ date: startDate });
        startDate.setTime(startDate.getTime() + interval * 60 * 1000);
        await timeout(500);
      }

      await Forma.sun.setDate({ date: currentDate });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Row>
      <SecondaryButton onClick={onClickPreview}>Preview</SecondaryButton>
    </Row>
  );
}
