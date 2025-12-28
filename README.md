<img src=".erb/img/erb-banner.svg" width="100%" />

<br>

<p>
  Electron React Boilerplate uses <a href="https://electron.atom.io/">Electron</a>, <a href="https://facebook.github.io/react/">React</a>, <a href="https://github.com/reactjs/react-router">React Router</a>, <a href="https://webpack.js.org/">Webpack</a> and <a href="https://www.npmjs.com/package/react-refresh">React Fast Refresh</a>.
**St. Mary of the Hills Presentation Creator**

A desktop app for creating PowerPoint presentations from templates and slide content. Built with Electron, React and TypeScript.

**Quick links**
- **Repo:** [package.json](package.json#L1)
- **Main process:** [src/main/main.ts](src/main/main.ts#L1)
- **Renderer:** [renderer/App.tsx](renderer/App.tsx#L1)

**Features**
- **Create PPTX:** generate PowerPoint files using templates and selected slides.
- **Template & file selectors:** import templates and choose files via the UI.
- **Drag & drop UI:** reorder and preview slides before export.
- **Cross-platform packaging:** Windows installer (NSIS), macOS DMG, Linux AppImage (via `electron-builder`).

**Requirements**
- **Node:** >= 14
- **npm:** >= 7

**Getting started (development)**

- Install dependencies:

  ```bash
  npm install
  ```

- Start the app in development mode (hot-reload renderer):

  ```bash
  npm start
  ```

**Build & package**

- Build production bundles:

  ```bash
  npm run build
  ```

- Create distributables (local):

  ```bash
  npm run package
  ```

**Scripts**
- **start:** Run the app in development.
- **build:** Build main + renderer for production.
- **package:** Build and package distributables via `electron-builder`.
- **test:** Run unit tests (`jest`).

**Where to look**
- **Main process:** [src/main/main.ts](src/main/main.ts#L1) — app lifecycle, menus, IPC handlers.
- **Renderer:** [renderer/App.tsx](renderer/App.tsx#L1) and [renderer/elements](renderer/elements) — UI components (template selector, file selectors, card views).
- **Utilities:** [src/main/util.ts](src/main/util.ts#L1) and [renderer/utilities](renderer/utilities) — helper functions and YAML handling.

**Contributing**
- Fork and open a PR. Run `npm install` and `npm run lint` before submitting changes.

**License**
- MIT — see [package.json](package.json#L1) for details.

- [John Tran](https://github.com/jooohhn)
- [C. T. Lin](https://github.com/chentsulin)
- [Jhen-Jie Hong](https://github.com/jhen0409)

## License

MIT © [Electron React Boilerplate](https://github.com/electron-react-boilerplate)

[github-actions-status]: https://github.com/electron-react-boilerplate/electron-react-boilerplate/workflows/Test/badge.svg
[github-actions-url]: https://github.com/electron-react-boilerplate/electron-react-boilerplate/actions
[github-tag-image]: https://img.shields.io/github/tag/electron-react-boilerplate/electron-react-boilerplate.svg?label=version
[github-tag-url]: https://github.com/electron-react-boilerplate/electron-react-boilerplate/releases/latest
[stackoverflow-img]: https://img.shields.io/badge/stackoverflow-electron_react_boilerplate-blue.svg
[stackoverflow-url]: https://stackoverflow.com/questions/tagged/electron-react-boilerplate
