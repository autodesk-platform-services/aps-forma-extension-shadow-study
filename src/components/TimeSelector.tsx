import _ from "lodash";
import { HelpText, Item, Row, Select, Title } from "../styles";
import { Event } from "../utils";

const formatTime = (x: number) => (x < 10 ? "0" + x : x);

type TimeSelectorProps = {
  startHour: number;
  setStartHour: (startHour: number) => void;
  startMinute: number;
  setStartMinute: (startMinute: number) => void;
  endHour: number;
  setEndHour: (endHour: number) => void;
  endMinute: number;
  setEndMinute: (endMinute: number) => void;
};

export default function TimeSelector(props: TimeSelectorProps) {
  const {
    startHour,
    setStartHour,
    startMinute,
    setStartMinute,
    endHour,
    setEndHour,
    endMinute,
    setEndMinute,
  } = props;

  return (
    <>
      <Row>
        <Title>Time</Title>
        <Item>
          <HelpText>From</HelpText>
          <Select
            width={"40px"}
            marginLeft={"10px"}
            value={startHour}
            onChange={(event: Event) => setStartHour(parseInt(event.currentTarget.value, 10))}
          >
            {_.range(25).map((value) => (
              <option value={value}>{formatTime(value)}</option>
            ))}
          </Select>
          <Select
            width={"40px"}
            marginLeft={"10px"}
            value={startMinute}
            onChange={(event: Event) => setStartMinute(parseInt(event.currentTarget.value, 10))}
          >
            {_.range(60).map((value) => (
              <option value={value}>{formatTime(value)}</option>
            ))}
          </Select>
        </Item>
      </Row>
      <Row>
        <Title></Title>
        <Item>
          <HelpText>To</HelpText>
          <Select
            width={"40px"}
            marginLeft={"10px"}
            value={endHour}
            onChange={(event: Event) => setEndHour(parseInt(event.currentTarget.value, 10))}
          >
            {_.range(25).map((value) => (
              <option value={value}>{formatTime(value)}</option>
            ))}
          </Select>
          <Select
            width={"40px"}
            marginLeft={"10px"}
            value={endMinute}
            onChange={(event: Event) => setEndMinute(parseInt(event.currentTarget.value))}
          >
            {_.range(60).map((value) => (
              <option value={value}>{formatTime(value)}</option>
            ))}
          </Select>
        </Item>
      </Row>
    </>
  );
}
