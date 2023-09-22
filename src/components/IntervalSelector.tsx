import { Select, Item, Row, Title } from "../styles";
import { Event } from "../utils";

type IntervalSelectorProps = {
  interval: number;
  setInterval: (interval: number) => void;
};

export default function IntervalSelector(props: IntervalSelectorProps) {
  const { interval, setInterval } = props;
  return (
    <Row>
      <Title>Frequency</Title>
      <Item>
        <Select
          value={interval}
          onChange={(event: Event) => setInterval(parseInt(event.currentTarget.value, 10))}
        >
          <option value="5">Every 5th minute</option>
          <option value="15">Every 15th minute</option>
          <option value="30">Every 30th minute</option>
          <option value="60">Every hour</option>
          <option value="120">Every 2nd hour</option>
        </Select>
      </Item>
    </Row>
  );
}
