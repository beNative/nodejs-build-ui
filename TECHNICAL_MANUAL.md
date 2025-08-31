# Technical Manual

This document outlines the technical architecture and the extensive diagnostic features of the Node.js Build UI application.

## 1. Core Technologies

-   **Electron:** The application is a cross-platform desktop application built using the Electron framework.
-   **React:** The user interface is built as a single-page application using React 18.
-   **TypeScript:** All code is written in TypeScript for type safety and improved developer experience.
-   **esbuild:** A fast JavaScript bundler is used to compile the JSX/TSX source code into a single JavaScript file for the browser.
-   **Tailwind CSS:** A utility-first CSS framework is used for styling the application.

## 2. Project Structure
(See `README.md` for a simplified structure view)

## 3. State Management

-   **Local Component State:** Most UI state (like modal visibility) is managed within individual React components using `useState`.
-   **App-level State:** The primary application state, including the list of configured `apps` and `settings`, is managed in the main `App.tsx` component.
-   **Context API:** The application makes heavy use of React's Context API for state management and dependency injection:
    -   `LoggerContext`: Provides logging functionality to any component in the tree.
    -   `DebugContext`: Provides the global application state and render profiling events to the diagnostic tools.
-   **Local Storage:** The list of configured applications (`apps`) is persisted between sessions by saving it to the browser's `localStorage`.

## 4. Electron Integration

The application follows Electron's standard and secure multi-process architecture.

-   **Main Process (`electron.js`):** This is the application's Node.js backend. It has been instrumented with extensive `console.log` statements to trace its lifecycle and IPC handling in the terminal where you launch the app.
-   **Renderer Process (The React App):** This is the frontend code.
-   **Preload Script (`preload.js`):** This script acts as a secure bridge, using `contextBridge` to expose a safe API (`window.electronAPI`) to the renderer.

## 5. Diagnostic and Debugging Systems

### 5.1. Startup Tracer

-   **Implementation:** A `<pre>` element and an inline `<script>` in `index.html`.
-   **Purpose:** To provide immediate visual feedback during the application's boot sequence, running even before the main JavaScript bundle is parsed. It helps diagnose "white screen" issues by showing if the HTML fails to load, if a script fails to parse, or if React fails to mount. The `index.tsx` file continues to write to this tracer until React has successfully mounted.

### 5.2. IPC Inspector

-   **Implementation:** A JavaScript `Proxy` object in `services/electronAPI.ts`.
-   **Purpose:** The proxy wraps the entire `electronAPI` object. It intercepts every function call and event listener registration, automatically logging the action, its arguments, and its results to the **IPC channel** in the logging panel. This makes the communication between the frontend and backend completely transparent for debugging.

### 5.3. Advanced Logging System

-   **Implementation:** `LoggerContext`, `LoggingPanel.tsx`.
-   **Purpose:** A highly organized, filterable logging system.
-   **Channels:**
    -   **APP:** For general application logic, user actions, and state changes.
    -   **SYSTEM:** For React component lifecycle events (mount, unmount, re-render). This is primarily driven by the `useLifecycleLogger` hook.
    -   **IPC:** For all frontend-backend communication, automatically populated by the IPC Inspector.
-   **Features:** The UI panel allows filtering by channel and by a free-text search.

### 5.4. Debug Panel

-   **Implementation:** `DebugPanel.tsx`, `DebugContext.tsx`.
-   **Purpose:** A central, floating UI for deep, real-time introspection of the application.
-   **Features:**
    -   **State Inspector:** Renders a live, formatted view of the entire global state object from `App.tsx`.
    -   **Render Profiler:** Consumes events from the `useLifecycleLogger` hook and displays a running list of component render events, helping to identify performance issues or unexpected render loops.
    -   **Debug Actions:** Provides buttons to trigger specific events, like testing the application's `ErrorBoundary` or clearing all `localStorage` data to reset the app.

### 5.5. Lifecycle Logger Hook

-   **Implementation:** `hooks/useLifecycleLogger.ts`.
-   **Purpose:** A custom React hook that, when added to a component, automatically logs its mount, unmount, and re-render events to the **SYSTEM channel**, and also pushes render events to the Debug Panel's profiler. This is an invaluable tool for understanding how and why components update.