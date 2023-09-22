import _ from "lodash";
import { Item, Row, Select, Title } from "../styles";
import { Event } from "../utils";
import { MONTHS } from "../utils";

type DateSelectorProps = {
  month: number;
  setMonth: (month: number) => void;
  day: number;
  setDay: (day: number) => void;
};

export default function DateSelector(props: DateSelectorProps) {
  const { month, setMonth, day, setDay } = props;

  return (
    <Row>
      <Title>Date</Title>
      <Item>
        <Select
          width={"80px"}
          value={month}
          onChange={(event: Event) => setMonth(parseInt(event.currentTarget.value, 10))}
        >
          {MONTHS.map((name, value) => (
            <option value={value}>{name}</option>
          ))}
        </Select>
        <Select
          width={"40px"}
          marginLeft={"10px"}
          value={day}
          onChange={(event: Event) => setDay(parseInt(event.currentTarget.value, 10))}
        >
          {_.range(1, 31).map((value) => (
            <option value={value}>{value}</option>
          ))}
        </Select>
      </Item>
    </Row>
  );
}
