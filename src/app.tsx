import { useState, useEffect } from "preact/hooks";
import DateSelector from "./components/DateSelector";
import ExportButton from "./components/ExportButton";
import TimeSelector from "./components/TimeSelector";
import PreviewButton from "./components/PreviewButton";
import GeometryColorSelector from "./components/GeometryColorSelector";
import ResolutionSelector from "./components/ResolutionSelector";
import { Forma } from "forma-embedded-view-sdk/auto";

interface DateEntry {
  month: number;
  day: number;
}

export default function App() {
  // Default to June 21 - standard reference date for summer solstice
  const [selectedMonth, setSelectedMonth] = useState(6);  // June
  const [selectedDay, setSelectedDay] = useState(21);
  const [isSingleTime, setIsSingleTime] = useState(false);
  const [singleHour, setSingleHour] = useState(12);
  const [singleMinute, setSingleMinute] = useState(0);
  const [dates, setDates] = useState<DateEntry[]>([]);
  const [interval, setInterval] = useState(60);
  const [startHour, setStartHour] = useState(8);
  const [startMinute, setStartMinute] = useState(0);
  const [endHour, setEndHour] = useState(20);
  const [endMinute, setEndMinute] = useState(0);
  const [resolution, setResolution] = useState("2048x1536");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [isGif, setIsGif] = useState(false);

  useEffect(() => {
    const initYear = async () => {
      try {
        const currentDate = await Forma.sun.getDate();
        setYear(currentDate.getFullYear());
      } catch (e) {
        console.log("Error getting project year:", e);
      }
    };
    initYear();
  }, []);

  useEffect(() => {
    // If switching to single time mode, ensure isGif is false
    if (isSingleTime && isGif) {
      setIsGif(false);
    }
  }, [isSingleTime]);

  const handleAddDate = (month: number, day: number) => {
    setDates([...dates, { month, day }]);
  };

  const handleRemoveDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
  };

  return (
    <>
      <h1>Shadow study</h1>
      <DateSelector 
        month={selectedMonth}
        setMonth={setSelectedMonth}
        day={selectedDay}
        setDay={setSelectedDay}
        dates={dates}
        onAddDate={handleAddDate}
        onRemoveDate={handleRemoveDate}
        year={year}
      />
      <TimeSelector
        isSingleTime={isSingleTime}
        setIsSingleTime={setIsSingleTime}
        singleHour={singleHour}
        setSingleHour={setSingleHour}
        singleMinute={singleMinute}
        setSingleMinute={setSingleMinute}
        startHour={startHour}
        setStartHour={setStartHour}
        startMinute={startMinute}
        setStartMinute={setStartMinute}
        endHour={endHour}
        setEndHour={setEndHour}
        endMinute={endMinute}
        setEndMinute={setEndMinute}
        interval={interval}
        setInterval={setInterval}
      />
      <PreviewButton
        isSingleTime={isSingleTime}
        singleHour={singleHour}
        singleMinute={singleMinute}
        defaultDateIndex={0}
        dates={dates}
        startHour={startHour}
        startMinute={startMinute}
        endHour={endHour}
        endMinute={endMinute}
        interval={interval}
      />
      <div class="section">
        <div class="section-title">Colors</div>
        <GeometryColorSelector />
      </div>
      <div class="section">
        <div class="section-title">Export</div>
        {!isSingleTime && (
          <>
            <div class="section-content" style={{ marginBottom: "10px" }}>
              <weave-button
                variant={isGif ? "outlined" : "solid"}
                onClick={() => setIsGif(false)}
                style={{ width: "70px" }}
              >
                Images
              </weave-button>
              <weave-button
                variant={isGif ? "solid" : "outlined"}
                onClick={() => setIsGif(true)}
                style={{ width: "70px", marginLeft: "5px" }}
              >
                GIF
              </weave-button>
            </div>
            <ResolutionSelector resolution={resolution} setResolution={setResolution} />
          </>
        )}
        {isSingleTime && (
          <ResolutionSelector resolution={resolution} setResolution={setResolution} />
        )}
        <ExportButton
          isSingleTime={isSingleTime}
          singleHour={singleHour}
          singleMinute={singleMinute}
          dates={dates}
          startHour={startHour}
          startMinute={startMinute}
          endHour={endHour}
          endMinute={endMinute}
          interval={interval}
          resolution={resolution}
          isGif={isGif}
        />
      </div>
    </>
  );
}
