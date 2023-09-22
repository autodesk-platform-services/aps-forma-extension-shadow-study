import { Item, Select, Row, Title } from "../styles";
import { Event } from "../utils";

type ResolutionSelectorProps = {
  resolution: string;
  setResolution: (resolution: string) => void;
};

export default function ResolutionSelector(props: ResolutionSelectorProps) {
  const { resolution, setResolution } = props;
  return (
    <Row>
      <Title>Size</Title>
      <Item>
        <Select
          value={resolution}
          onChange={(event: Event) => setResolution(event.currentTarget.value)}
        >
          <option value="512x384">Small (512x384)</option>
          <option value="1024x768">Medium (1024x768)</option>
          <option value="2048x1536">Large (2048x1536)</option>
          <option value="3840x2160">4K (3840x2160)</option>
        </Select>
      </Item>
    </Row>
  );
}
