# Version Log

All notable changes to this project will be documented in this file.

## [1.3.0] - YYYY-MM-DD

### Fixed
-   **CRITICAL: Blank Screen on Start:** Resolved the primary issue preventing the application from rendering. The `importmap` script in `index.html` was conflicting with the `esbuild` bundle, causing a fatal error. The import map has been removed.

### Added
-   **Startup Tracer:** An on-screen log that traces the application's boot sequence from HTML parsing to React mounting, providing immediate feedback to diagnose startup failures.
-   **Comprehensive Debug Panel:** Added a floating debug panel, accessible from the status bar, with the following features:
    -   **Live State Inspector:** A real-time view of the entire application state.
    -   **Component Render Profiler:** A live feed of component mount, unmount, and re-render events.
    -   **Debug Actions:** Buttons to test the error boundary and clear local storage.
-   **IPC Call Inspector:** All communication between the frontend (React) and backend (Electron) is now automatically intercepted and logged to a new `IPC` channel in the logger, showing every call, its arguments, and its result.
-   **Component Lifecycle Logging Hook (`useLifecycleLogger`):** A new custom hook to automatically log component lifecycle events to a `SYSTEM` channel for deep debugging.
-   **Enhanced Logging Panel:**
    -   Logs are now categorized into channels: `APP`, `SYSTEM`, and `IPC`.
    -   Added a search bar to filter log messages.
    -   UI has been updated to filter by channel.
-   **Debug Context:** A new React context (`DebugContext`) was added to provide diagnostic information to the debug tools.

### Changed
-   The application has been significantly refactored to support the new diagnostic systems.
-   The logging system (`LoggerContext`) was overhauled to support channels.
-   The `electronAPI` service was wrapped in a `Proxy` to enable automatic IPC logging.

## [1.2.0] - YYYY-MM-DD

### Fixed
-   Corrected the logic for displaying command output to ensure it streams correctly and doesn't show stale data.

### Added
-   **Electron Main Process (`electron.js`):** Implemented the core backend process for the Electron app. It now handles window creation, application lifecycle, and all Node.js-based operations (file system, command execution).
-   **Electron Preload Script (`preload.js`):** Created a secure bridge to expose safe backend functions to the React frontend using `contextBridge`.
-   **Enhanced Logging:** Added detailed startup logs in the main process and preload script to make future debugging easier. DevTools now open automatically in development mode.

### Changed
-   **Architecture:** The application is now a fully-fledged Electron app with a proper main/renderer/preload architecture.
-   **Security:** Added a Content Security Policy (CSP) to `index.html` to enhance security.

## [1.1.0] - YYYY-MM-DD

### Added
-   **Info Tab:** A new section in the UI for viewing application documentation.
-   **Documentation:** Added README, Functional Manual, Technical Manual, and a Version Log, which are viewable in the Info Tab.
-   **Logging Panel:** A collapsible application logging panel at the bottom of the window.
-   **Status Bar:** A new status bar at the bottom displaying summary information.

## [1.0.0] - YYYY-MM-DD

### Added
-   Initial release.
-   Core functionality for adding, viewing, and deleting Node.js application configurations.
-   Ability to run pre-defined commands.
-   Real-time status indicators and log viewing for commands.