import { Forma } from "forma-embedded-view-sdk/auto";
import { SecondaryButton, Row } from "../styles";

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
      const currentDate = await Forma.sun.getDate();
      const year = currentDate.getFullYear();
      const startDate = new Date(year, month, day, startHour, startMinute, 0, 0);
      const endDate = new Date(year, month, day, endHour, endMinute, 0, 0);

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
      <SecondaryButton category={"secondary"} onClick={onClickPreview}>
        Preview
      </SecondaryButton>
    </Row>
  );
}
