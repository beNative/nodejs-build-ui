# Technical Manual

This document outlines the technical architecture of the Node.js Build UI application.

## 1. Core Technologies

-   **Electron:** The application is a cross-platform desktop application built using the Electron framework.
-   **React:** The user interface is built as a single-page application using React 18.
-   **TypeScript:** All code is written in TypeScript for type safety and improved developer experience.
-   **esbuild:** A fast JavaScript bundler is used to compile the JSX/TSX source code into a single JavaScript file for the browser.
-   **Tailwind CSS:** A utility-first CSS framework is used for styling the application.

## 2. Project Structure

```
.
├── dist/               # Build output for the frontend
├── components/         # Reusable React components
├── contexts/           # React Context providers
├── services/           # API clients
│   └── electronAPI.ts
├── App.tsx             # Main application component
├── index.html          # HTML entry point for Electron
├── index.tsx           # React root renderer
├── electron.mjs        # Electron Main Process (backend)
├── preload.mjs         # Electron Preload Script (security bridge)
├── package.json        # Project manifest and scripts
├── types.ts            # Shared TypeScript types
└── *.md                # Documentation files
```

## 3. State Management

-   **Local Component State:** Most UI state (like modal visibility) is managed within individual React components using `useState`.
-   **App-level State:** The primary application state, including the list of configured `apps` and `settings`, is managed in the main `App.tsx` component.
-   **Context API:** The logging system uses React's Context API (`LoggerContext.tsx`) to provide logging functionality to any component in the tree without prop drilling.
-   **Local Storage:** The list of configured applications (`apps`) is persisted between sessions by saving it to the browser's `localStorage`.

## 4. Electron Integration

The application follows Electron's standard and secure multi-process architecture.

-   **Main Process (`electron.mjs`):** This is the application's Node.js backend. It runs with full Node.js privileges and is responsible for:
    -   Creating and managing application windows (`BrowserWindow`).
    -   Handling the application lifecycle events.
    -   Interacting with the operating system using Node.js APIs like `fs` (for file system access), `child_process` (to run shell commands), and Electron's `dialog` module (for native file dialogs).
    -   Listening for events from the renderer process via `ipcMain`.

-   **Renderer Process (The React App):** This is the frontend code running in a Chromium window (`index.html` and `bundle.js`). For security, this process does not have direct access to Node.js APIs. All backend operations must be requested through the preload script.

-   **Preload Script (`preload.mjs`):** This script acts as a secure bridge between the Main and Renderer processes. It runs in a privileged context and uses Electron's `contextBridge` to expose a specific, safe API (`window.electronAPI`) to the renderer process. This prevents the frontend from accessing powerful, potentially dangerous Node APIs directly. The `services/electronAPI.ts` file then consumes this exposed API.

### Key `electronAPI` functions:

-   `runCommand`: Invokes an `ipcMain` handler in `electron.mjs` that uses `child_process.spawn` to execute shell commands and streams `stdout`/`stderr` back to the renderer.
-   `selectDirectory`: Uses Electron's `dialog.showOpenDialog`.
-   `getMarkdownContent`, `loadSettings`, `saveSettings`: Use the `fs` module in the main process to read and write files on the user's disk.

## 5. Build Process

-   `npm run dev`: Runs `esbuild` in watch mode to continuously build `bundle.js` into the `/dist` folder and concurrently launches the Electron app. `wait-on` ensures Electron doesn't start before the first build is complete.
-   `npm run build`: Performs a one-time production build using `esbuild` and copies the markdown documentation into the `/dist` directory so it can be packaged with the application.

## 6. Packaging

The application uses **Electron Builder** for packaging. The configuration is located in the `build` section of `package.json`.
-   `npm run package:win`: This script first runs the production `build` script and then uses `electron-builder` to package the app into a Windows installer.
-   The `files` array in the `build` config specifies all necessary assets to be included in the final package, including the main and preload scripts, the `dist` folder containing the UI code and documentation, and `index.html`.