namespace JSX {
  interface IntrinsicElements {
    "weave-button": JSX.HTMLAttributes<HTMLElement> & {
      type?: "button" | "submit" | "reset";
      variant?: "outlined" | "flat" | "solid";
      density?: "high" | "medium";
      iconposition?: "left" | "right";
    };
    "weave-select": JSX.HTMLAttributes<HTMLElement> & {
      placeholder?: any;
      value: any;
      children: JSX.Element[];
      onChange: (e: CustomEvent<{ value: string; text: string }>) => void;
    };
    "weave-select-option": JSX.HTMLAttributes<HTMLElement> & {
      disabled?: true;
      value: any;
      children?: JSX.Element | string;
    };
    "weave-checkbox": {
      onChange?: (e: CustomEvent) => void;
      children?: JSX.Element | string;
      style?: string;
      checked: boolean;
      showlabel?: boolean;
      label?: string;
      value?: string;
      key?: string;
      disabled?: boolean;
    };
  }
}
