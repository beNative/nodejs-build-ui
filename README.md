# Node.js Build UI

A user-friendly desktop application for managing and automating build, test, and deployment tasks for multiple Node.js applications. Built with React, TypeScript, and Electron for seamless local development workflows.

This version has been heavily instrumented with diagnostic and debugging tools to serve as a learning aid for understanding the internals of a modern web/desktop application.

## Features

- **Project Dashboard:** View all your configured Node.js applications in one clean interface.
- **Configurable Projects:** Easily add new projects by specifying a name and local directory path.
- **One-Click Automation:** Run predefined commands like `git pull`, `npm install`, `npm run build`, and `npm test` with a single click.
- **Real-time Output:** View the real-time output of any running command in a detailed log viewer.
- **Status Indicators:** Instantly see the status (idle, running, success, error) of each command for each project.
- **Persistent Configuration:** Your list of applications is saved locally, so you don't have to reconfigure it on every launch.

### Over-engineered Debugging Suite

-   **Startup Tracer:** An on-screen log that appears on application start to trace the boot sequence, from HTML parsing to React mounting, to easily diagnose blank-screen issues.
-   **Advanced Logging Panel:** A multi-channel logging console for deep insight:
    -   **Channels:** Logs are separated into `APP` (application logic), `SYSTEM` (React lifecycle), and `IPC` (frontend-backend communication) channels.
    -   **Searchable:** Instantly filter all log messages with a text search.
-   **Floating Debug Panel:** A powerful diagnostic window accessible from the status bar, featuring:
    -   **Live State Inspector:** A real-time view of the entire React application state.
    -   **Component Render Profiler:** See a live feed of which components are mounting, unmounting, and re-rendering to understand React's behavior.
    -   **Debug Actions:** Buttons to test error boundaries, add test logs, and clear application storage.
-   **Transparent IPC:** All communication between the React frontend and the Electron backend is automatically logged, showing every function call, its arguments, and its return value.

## Tech Stack

- **UI Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** esbuild
- **Desktop Framework:** Electron
- **Styling:** Tailwind CSS

## Architecture Overview

This application follows the standard Electron multi-process architecture:
- **Main Process (`electron.js`):** The Node.js backend that controls the application lifecycle, creates browser windows, and handles all native OS interactions (e.g., file system access, running shell commands).
- **Renderer Process (React App):** The frontend UI that runs inside a Chromium browser window. For security, it does not have direct access to Node.js APIs.
- **Preload Script (`preload.js`):** A secure bridge that exposes specific, safe functions from the Main Process to the Renderer Process, allowing the UI to request backend operations.

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd nodejs-build-ui
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run in development mode:**
    This command will concurrently build the React code and launch the Electron app. The builder will watch for file changes and rebuild automatically.
    ```bash
    npm run dev
    ```

4.  **Build for production:**
    To create a production build of the React app:
    ```bash
    npm run build
    ```

5.  **Package for Windows:**
    This command will first build the production assets and then package them into a Windows installer (`.exe`) located in the `dist-electron` folder.
    ```bash
    npm run package:win
    ```
