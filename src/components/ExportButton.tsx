import { Forma } from "forma-embedded-view-sdk/auto";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { DateTime } from "luxon";
import { MONTHS } from "../constants";
import { encode } from "modern-gif";
import workerUrl from "modern-gif/worker?url";

interface DateEntry {
  month: number;
  day: number;
}

interface Props {
  isSingleTime: boolean;
  singleHour: number;
  singleMinute: number;
  dates: DateEntry[];
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  interval: number;
  resolution: string;
  isGif: boolean;
}

export default function ExportButton({
  isSingleTime,
  singleHour,
  singleMinute,
  dates,
  startHour,
  startMinute,
  endHour,
  endMinute,
  interval,
  resolution,
  isGif,
}: Props) {
  const onClickExport = async () => {
    if (dates.length === 0) {
      alert("Please add at least one date to export");
      return;
    }

    try {
      const projectTimezone = await Forma.project.getTimezone();
      if (!projectTimezone) {
        throw new Error("Unable to access project timezone");
      }
      const currentDate = await Forma.sun.getDate();
      const year = currentDate.getFullYear();

      const width = parseInt(resolution.split("x")[0], 10);
      const height = parseInt(resolution.split("x")[1], 10);

      if (isSingleTime) {
        // Export single image
        const date = dates[0];
        await Forma.sun.setDate({
          date: DateTime.fromObject(
            {
              year,
              month: date.month,
              day: date.day,
              hour: singleHour,
              minute: singleMinute,
            },
            { zone: projectTimezone },
          ).toJSDate(),
        });

        const canvas = await Forma.camera.capture({ width, height });
        const filename = `Shadow-${MONTHS[date.month - 1]}-${date.day}-${singleHour.toString().padStart(2, "0")}-${singleMinute.toString().padStart(2, "0")}.png`;
        saveAs(canvas.toDataURL(), filename);
      } else {
        if (isGif) {
          // Handle each date separately
          for (const date of dates) {
            const frames: { data: Uint8ClampedArray; delay: number }[] = [];
            let current = DateTime.fromObject(
              {
                year,
                month: date.month,
                day: date.day,
                hour: startHour,
                minute: startMinute,
              },
              { zone: projectTimezone },
            );
            const endTime = DateTime.fromObject(
              {
                year,
                month: date.month,
                day: date.day,
                hour: endHour,
                minute: endMinute,
              },
              { zone: projectTimezone },
            );

            try {
              while (current.toMillis() <= endTime.toMillis()) {
                await Forma.sun.setDate({ date: current.toJSDate() });
                const canvas = await Forma.camera.capture({ width, height });
                const ctx = canvas.getContext("2d");
                if (!ctx) throw new Error("Could not get 2D context from canvas.");
                const imageData = ctx.getImageData(0, 0, width, height);
                frames.push({ data: imageData.data, delay: 500 }); // 500ms delay
                current = current.plus({ minutes: interval });
              }

              // Use modern-gif to encode
              const output = await encode({
                workerUrl,
                width,
                height,
                frames,
              });
              const gifBlob = new Blob([output], { type: "image/gif" });
              saveAs(gifBlob, `Shadow-${MONTHS[date.month - 1]}-${date.day}.gif`);
            } finally {
              await Forma.sun.setDate({ date: currentDate });
            }
          }
        } else {
          // Export zip with multiple images
          const zip = new JSZip();
          const zipFolder = zip.folder("shadow-study") as JSZip;

          try {
            for (const date of dates) {
              const dateFolder = zipFolder.folder(`${MONTHS[date.month - 1]}-${date.day}`) as JSZip;
              let current = DateTime.fromObject(
                {
                  year,
                  month: date.month,
                  day: date.day,
                  hour: startHour,
                  minute: startMinute,
                },
                { zone: projectTimezone },
              );
              const endTime = DateTime.fromObject(
                {
                  year,
                  month: date.month,
                  day: date.day,
                  hour: endHour,
                  minute: endMinute,
                },
                { zone: projectTimezone },
              );

              while (current.toMillis() <= endTime.toMillis()) {
                await Forma.sun.setDate({ date: current.toJSDate() });
                const filename = `${current.toFormat("HH-mm")}.png`;
                const canvas = await Forma.camera.capture({ width, height });
                const data = canvas.toDataURL().split("base64,")[1];
                dateFolder.file(filename, data, { base64: true });
                current = current.plus({ minutes: interval });
              }
            }
          } finally {
            await Forma.sun.setDate({ date: currentDate });
          }

          const folderName = "Shadow study.zip";
          zipFolder.generateAsync({ type: "blob" }).then((content) => saveAs(content, folderName));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div class="section">
      <div class="section-content" style={{ justifyContent: "center" }}>
        <weave-button 
          variant="solid" 
          onClick={onClickExport} 
          data-disabled={dates.length === 0 ? "" : undefined}
        >
          {isSingleTime 
            ? "Export image" 
            : `Export ${isGif ? "animation" : "images"}`
          }
        </weave-button>
      </div>
    </div>
  );
}
