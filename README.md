# This is an example extension for Autodesk Forma

This extension is built using the **[Forma SDK for Javascript](https://aps-dev.autodesk.com/en/docs/forma/v1/reference/embedded-view-sdk/)** using an `Embedded View` in the `Right hand side analysis panel`

**What it does:** Lets the user select a time range, date, and inverval to generate a shadow study consisting of screenshots of the proposal with selected sun positions. Extension ID: 4aff4df1-dcd1-422b-94ca-0d1bb776cf18

### How was this built

The extension was originally built as a
[slimmed down version](https://github.com/spacemakerai/forma-extensions-samples/tree/main/analyses/shadow-study-slim)
with the bare minimum required to get it up and running. In the current version,
it has been rewritten in a [vite](https://vitejs.dev/) +
[preact](https://preactjs.com/) framework to enable
[typescript](https://www.typescriptlang.org/), [React components](https://react.dev/)
and other features which are typical in a modern web developers toolbox.

We refer to the slimmed down version's [README](https://github.com/spacemakerai/forma-extensions-samples/tree/main/analyses/shadow-study-slim/readme.md) for an explanation of the core functionality of the extension.

### Local testing

In order to work with this extension locally, make sure you have the [local testing extension](https://aps.autodesk.com/en/docs/forma/v1/developers_guide/local-testing-extension/) for Forma installed. Install dependencies using

```shell
yarn install
```

and then you just need to run

```shell
yarn start
```

### Contributing

We welcome pull requests with suggestions for improvements from all contributors!
