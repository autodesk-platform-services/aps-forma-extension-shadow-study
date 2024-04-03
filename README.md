# Shadow study: example extension for Forma

This extension is built using the
**[Forma SDK for Javascript](https://aps.autodesk.com/en/docs/forma/v1/embedded-views/introduction/)**
using an _**Embedded View**_ in the _**Right hand side analysis panel**_.
We recommend checking out the link to learn more about creating extensions and
to access the full API reference of the SDK.

This extension can be accessed by all users of Forma by activating it in the
Forma extensions menu. It is automatically deployed and hosted from this repo.

- [Motivation](#motivation)
- [How was this built](#how-was-this-built)
  - [File structure](#file-structure)
  - [Core logic](#core-logic)
    - [State management and main components](#state-management-and-main-components)
    - [Using the Forma API](#using-the-forma-api)
  - [Styling](#styling)
- [Local Development](#local-development)
- [Deployment and hosting](#deployment-and-hosting)
- [Contributing](#contributing)
  - [Suggestions for improvements](#suggestions-for-improvements)

## Motivation

The shadow study extension lets the user select a time range, date and inverval
to generate a shadow study consisting of screenshots of the proposal at
selected sun positions for the given times. This is a typical workflow for many
architects which can be time-consuming to do with traditional tools.

![Shadow study illustration screenshot](/assets/Screenshot.png)

## How was this built

The extension was built in a [vite](https://vitejs.dev/) +
[preact](https://preactjs.com/) framework to enable
[typescript](https://www.typescriptlang.org/),
[React components](https://react.dev/) and other features which are typical in a
modern web developers toolbox.

### File structure

Most of the top-level files in this repository are configurators etc. All source
code is in the `src/` directory, but the entry-point for our extension is
`index.html`. The most important part of it is the body, which includes the
main typescript file:

```html
<body>
  <div id="app"></div>
  <script type="module" src="./src/main.tsx"></script>
</body>
```

In `src/main.tsx`, we just use `preact` to render the `<App />` component
defined in `src/app.tsx`. For most intents, the latter file is a useful starting
point for making changes to the extension:

All subcomponents used within the app live in
`src/components/`.

It is also worth noting that the Forma SDK is added as a dependency in `package.json` and automatically installed by using `yarn`:

```json
  "dependencies": {
    "file-saver": "^2.0.5",
    "forma-embedded-view-sdk": "^0.15.0",
    "jszip": "3.10.1",
    "lodash": "^4.17.21",
    "luxon": "^3.4.3",
    "preact": "^10.17.1"
  },
```

### Core logic

In this section we will exemplify core logic of the extension, but please head
directly to the file tree to get a full overview.

#### State management and main components

After some imports, the `App` component is defined:

```ts
import { useState } from "preact/hooks";
import DateSelector from "./components/DateSelector";
// ...more imports

export default function App() {
  const [month, setMonth] = useState(6);
  //... more state setup

  return (
    <>
      <h1>Shadow study</h1>
      <DateSelector month={month} setMonth={setMonth} day={day} setDay={setDay} />
      //... more components
    </>
  )
}
```

If you are not accustomed to state management and hooks such as `useState`, we
recommend looking at the [React docs](https://react.dev/learn). Here, we are
just initialising the chosen month to June and creating a setter function for
changing it. These state objects can then be passed on to e.g. our
`DateSelector` component (`src/components/DateSelector.tsx`) which handles the
first dropdown `select` in our extension.

#### Using the Forma API

Let's take a look at the `PreviewButton` component (`src/components/PreviewButton.tsx`), which loops through the
selected times and shows the user which screenshots would be generated:

```ts
import { Forma } from "forma-embedded-view-sdk/auto";
import { DateTime } from "luxon";

// ... excluded for brevity

export default function PreviewButton(props: PreviewButtonProps) {
  const { month, day, startHour, startMinute, endHour, endMinute, interval } = props;

  const onClickPreview = async () => {
    try {
      const projectTimezone = await Forma.project.getTimezone();
      if (!projectTimezone) {
        throw new Error("Unable to access project timezone");
      }
      const originalDate = await Forma.sun.getDate();
      const year = originalDate.getFullYear();

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
      const end = DateTime.fromObject(
        {
          year,
          month,
          day,
          hour: endHour,
          minute: endMinute,
        },
        { zone: projectTimezone },
      );

      while (current.toMillis() <= end.toMillis()) {
        await Forma.sun.setDate({ date: current.toJSDate() });
        current = current.plus({ minutes: interval });
        await timeout(500);
      }
      await Forma.sun.setDate({ date: originalDate });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div class="row">
      <weave-button variant="outlined" onClick={onClickPreview}>
        Preview
      </weave-button>
    </div>
  );
}

```

The first which happens when the user clicks the _Preview_ button, is that we fetch the currently set date in the Forma scene, along with the timezone which the project is located in:

```ts
const originalDate = await Forma.sun.getDate();
const projectTimezone = await Forma.project.getTimezone();
```

We want this info in order to reset the scene after the illustration is
complete, and to make sure that we offset dates and times correctly.
It is worth pointing out that most functionality in the SDK is `async` and must
be awaited or resolved.

Since `Date` objects in JavaScript are based on the instance where the script is
run, it is important to capture the discrepancy between the machine local time
and the time at the project location. We use
[Luxon](https://moment.github.io/luxon/#/) to handle this -- their website has a
lot of good documentation on the intricacies of time zones.

We then access the selected start and end times through the `props` which are
sent into the component. The state of these are handled in the main app as
described above. We loop from the start time to the end time in `interval` increments, and for each loop cycle:

1. update the sun position in the scene using `Forma.sun.setDate()`
2. increment the current time by `interval` minutes
3. wait for half a second to let the user have a good look

When all the selected snapshots have been shown, we set the sun position back to what it was originally:

```ts
await Forma.sun.setDate({ date: originalDate });
```

The code employed by the `ExportButton` component is very similar, but there we
also store the snapshots using `Forma.camera.capture()` and download a compressed directory using
[JSZip](https://stuk.github.io/jszip/). Check it out!

### Styling

In order to achieve consistent styling with the rest of the Forma app, we utilise web components from the [Autodesk Forma Design System](https://app.autodeskforma.eu/design-system/v2/docs/). Follow the link to access a Storybook with extensive overview of available components and examples of usage.

Relevant resources are included in `index.html`:

```html
<head>
  <link
    rel="stylesheet"
    href="https://app.autodeskforma.eu/design-system/v2/forma/styles/base.css"
  />
  <link rel="stylesheet" href="./src/styles.css" />
  <script
    type="module"
    src="https://app.autodeskforma.eu/design-system/v2/weave/components/button/weave-button.js"
  ></script>
  <script
    type="module"
    src="https://app.autodeskforma.eu/design-system/v2/weave/components/dropdown/weave-select.js"
  ></script>
  <title>Shadow study</title>
</head>
```

Extension-specific styling is found in `src/styles.css`, while `src/lib/weave.d.ts` hold type declarations to enable working with the relevant web components in typescript:

```ts
export declare module "preact/src/jsx" {
  namespace JSXInternal {
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
    }
  }
}
```

## Local Development

In order to work with this extension locally, you need to [create your own extension](https://aps.autodesk.com/en/docs/forma/v1/overview/getting-started/), and configure the it to point to `http://localhost:8181`. We also recommend using the **RIGHT_MENU_ANALYSIS_PANEL** placement for this example.

You can now install dependencies by running

```shell
yarn install
```

and then you just need to run

```shell
yarn start
```

Your local version of this extension should now be running on port `8081`, and it should be visible in the analysis panel on
the right hand side of the Forma design UI.

## Deployment and hosting

This extension is updated using continuous integration and deployment. In practice, each commit to the `main` branch of this repo triggers [GitHub Actions](https://docs.github.com/en/actions) to build the static files, upload them to [GitHub pages](https://pages.github.com/) and finally deploy the changes so that the update reaches end users within a minute of the commit.

Check out the workflows in `.github/workflows/test-build-deploy.yml` to learn more about how this has been configured -- it constitutes a simple example of how to do CI/CD to get you started if you want to do something similar.

## Contributing

We welcome pull requests with suggestions for improvements from all contributors!

### Suggestions for improvements

- Loop over several dates at once
- Set the terrain texture to a background color of the user's choice
- Adjustable contrast of the shadow against the backdrop
