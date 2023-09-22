import { h } from "preact";
import { setup, styled } from "goober";

setup(h);

export const Header = styled("h1")`
  display: flex;
  flex-direction: column;
  justify-content: center;

  height: 48px;

  font-family: sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
`;

export const Row = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;

  height: 36px;
`;

export const Title = styled("div")`
  font-family: sans-serif;
  font-weight: 400;
  font-size: 11px;
`;

export const Item = styled("div")`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: baseline;

  width: 60%;
  max-width: 60%;
`;

export const Select = styled("select")`
  width: ${(props) => props.width || "100%"};
  height: 24px;
  margin-left: ${(props) => props.marginLeft || "0px"};

  font-family: sans-serif;
  font-weight: 400;
  font-size: 11px;

  border: 1px solid #80808033;
`;

export const HelpText = styled("div")`
  display: flex;
  justify-content: flex-end;

  width: 20px;

  font-family: sans-serif;
  font-weight: 400;
  font-size: 11px;

  color: #3c3c3cb2;
`;

export const Button = styled("button")`
  width: 100%;
  height: 24px;
  padding: 0;

  font-family: sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;

  color: #ffffff;
  background-color: #0696d7;

  border: 1px solid #80808000;
  border-radius: 2px;
  cursor: pointer;
`;
