import { Forma } from "forma-embedded-view-sdk/auto";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DateTime } from "luxon";

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
      const year = currentDate.getFullYear();

      const width = parseInt(resolution.split("x")[0], 10);
      const height = parseInt(resolution.split("x")[1], 10);

      const zip = new JSZip();
      const zipFolder = zip.folder("shadow-study") as JSZip;

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
      const endDate = DateTime.fromObject(
        {
          year,
          month,
          day,
          hour: endHour,
          minute: endMinute,
        },
        { zone: projectTimezone },
      );
      while (current.toMillis() <= endDate.toMillis()) {
        await Forma.sun.setDate({ date: current.toJSDate() });

        const filename =
          current.toLocaleString({
            timeZone: projectTimezone,
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }) + ".png";
        const canvas = await Forma.camera.capture({ width, height });
        const data = canvas.toDataURL().split("base64,")[1];
        zipFolder.file(filename, data, { base64: true });

        current = current.plus({ minutes: interval });
      }

      const folderName =
        "Shadow study - " +
        current.toLocaleString({ timeZone: projectTimezone, day: "2-digit" }) +
        " " +
        current.toLocaleString({ timeZone: projectTimezone, month: "long" }) +
        ".zip";
      zipFolder.generateAsync({ type: "blob" }).then((content) => saveAs(content, folderName));

      await Forma.sun.setDate({ date: currentDate });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="row">
      <weave-button variant={"solid"} onClick={onClickExport}>
        Export images
      </weave-button>
    </div>
  );
}
