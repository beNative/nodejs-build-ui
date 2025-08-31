# Version Log

All notable changes to this project will be documented in this file.

## [1.1.0] - YYYY-MM-DD

### Added
-   **Info Tab:** A new section in the UI for viewing application documentation.
-   **Documentation:** Added README, Functional Manual, Technical Manual, and a Version Log, which are viewable in the Info Tab.
-   **Logging Panel:** A collapsible application logging panel at the bottom of the window.
    -   Features log level filtering (DEBUG, INFO, WARNING, ERROR).
    -   Color-coded log messages for readability.
    -   Option to auto-save logs to a file (`nodejs-build-ui-YYYY-MM-DD.log`).
-   **Status Bar:** A new status bar at the bottom displaying the number of configured apps, a mock API status, and the current time.
-   **Settings Management:** Mock implementation for loading/saving application settings from a JSON file.

### Changed
-   The main application layout was updated to a tabbed interface to accommodate the new Info view.
-   Refactored the main `App` component to support the new layout and features.
-   Integrated a new `LoggerContext` for application-wide logging.

## [1.0.0] - YYYY-MM-DD

### Added
-   Initial release.
-   Core functionality for adding, viewing, and deleting Node.js application configurations.
-   Ability to run pre-defined commands (`git pull`, `npm install`, etc.) for each application.
-   Real-time status indicators for commands.
-   Modal view for detailed command output logs.
-   Application state is persisted in `localStorage`.
-   Setup with esbuild for bundling and Electron for the desktop environment.
