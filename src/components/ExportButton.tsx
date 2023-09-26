import { Forma } from "forma-embedded-view-sdk/auto";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { MONTHS, getTimezoneOffset } from "../utils";
import { PrimaryButton, Row } from "../styles";

type ExportButtonProps = {
  month: number;
  day: number;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  resolution: string;
  interval: number;
};

export default function ExportButton(props: ExportButtonProps) {
  const { month, day, startHour, startMinute, endHour, endMinute, resolution, interval } = props;

  const onClickExport = async () => {
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
      const width = parseInt(resolution.split("x")[0], 10);
      const height = parseInt(resolution.split("x")[1], 10);

      const zip = new JSZip();
      const zipFolder = zip.folder("shadow-study") as JSZip;

      while (startDate.getTime() <= endDate.getTime()) {
        await Forma.sun.setDate({ date: startDate });

        const filename =
          startDate.toLocaleString("en-GB", { timeZone: projectTimezone }).split(", ")[1] + ".png";
        const canvas = await Forma.camera.capture({ width, height });
        const data = canvas.toDataURL().split("base64,")[1];
        zipFolder.file(filename, data, { base64: true });

        startDate.setTime(startDate.getTime() + interval * 60 * 1000);
      }

      const folderName = "Shadow study - " + day + " " + MONTHS[month] + ".zip";
      zipFolder.generateAsync({ type: "blob" }).then((content) => saveAs(content, folderName));

      await Forma.sun.setDate({ date: currentDate });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Row>
      <PrimaryButton category={"primary"} onClick={onClickExport}>
        Export images
      </PrimaryButton>
    </Row>
  );
}
