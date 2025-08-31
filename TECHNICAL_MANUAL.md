# Technical Manual

This document outlines the technical architecture of the Node.js Build UI application.

## 1. Core Technologies

-   **Electron:** The application is designed as an Electron app, allowing it to run as a cross-platform desktop application using web technologies.
-   **React:** The user interface is built as a single-page application using React 18.
-   **TypeScript:** All code is written in TypeScript for type safety and improved developer experience.
-   **esbuild:** A fast JavaScript bundler is used to compile the JSX/TSX source code into a single JavaScript file for the browser.
-   **Tailwind CSS:** A utility-first CSS framework is used for styling the application.

## 2. Project Structure

```
.
├── components/         # Reusable React components
│   ├── AddAppModal.tsx
│   ├── AppCard.tsx
│   ├── CommandOutputModal.tsx
│   ├── Icons.tsx
│   ├── InfoTab.tsx
│   ├── LoggingPanel.tsx
│   └── StatusBar.tsx
├── contexts/           # React Context providers
│   └── LoggerContext.tsx
├── services/           # Mock services and APIs
│   └── electronAPI.ts
├── App.tsx             # Main application component
├── index.html          # HTML entry point
├── index.tsx           # React root renderer
├── package.json        # Project manifest and scripts
├── types.ts            # Shared TypeScript types
├── README.md           # Documentation files...
├── FUNCTIONAL_MANUAL.md
├── TECHNICAL_MANUAL.md
└── VERSION_LOG.md
```

## 3. State Management

-   **Local Component State:** Most UI state (like modal visibility) is managed within individual React components using `useState`.
-   **App-level State:** The primary application state, including the list of configured `apps` and `settings`, is managed in the main `App.tsx` component.
-   **Context API:** The logging system uses React's Context API (`LoggerContext.tsx`) to provide logging functionality to any component in the tree without prop drilling.
-   **Local Storage:** The list of configured applications (`apps`) is persisted between sessions by saving it to the browser's `localStorage`.

## 4. Electron Integration (Mocked)

In a real Electron application, there are three main processes: Main, Renderer, and Preload.

-   **Main Process (`electron.mjs`):** This would be the Node.js backend. It has access to OS-level features like the filesystem (`fs`), child processes (`child_process`), and native dialogs.
-   **Renderer Process (our React App):** This is the frontend code running in a Chromium window. It does not have direct access to Node.js APIs for security reasons.
-   **Preload Script:** A script that runs before the renderer process, acting as a bridge between the Main and Renderer processes. It exposes specific, secure APIs from the Main process to the Renderer process via the `window` object.

This project simulates this architecture using the mock file `services/electronAPI.ts`. This file exports an object that mimics the API that would be exposed by a preload script.

### Key `electronAPI` functions:

-   `runCommand`: In a real app, this would use `child_process.spawn` to execute shell commands and stream `stdout`/`stderr` back to the renderer.
-   `selectDirectory`: Would use Electron's `dialog.showOpenDialog`.
-   `getMarkdownContent`, `loadSettings`, `saveSettings`: Would use the `fs` module to read and write files on the user's disk.

## 5. Build Process

-   `npm run dev`: Runs `esbuild` in watch mode to continuously build `bundle.js` and runs `electron .` to launch the app. `wait-on` ensures Electron doesn't start before the first build is complete.
-   `npm run build`: Performs a one-time production build using `esbuild` and copies the markdown documentation into the root directory so it can be packaged with the application.

## 6. Packaging

To distribute the application, a packager like **Electron Forge** or **Electron Builder** would be used. The configuration for these tools would specify:
-   The main entry point (`electron.mjs`).
-   Files to be included in the final package (e.g., `index.html`, `bundle.js`, and the `.md` documentation files).
-   Icons and platform-specific settings (for Windows, macOS, Linux).
