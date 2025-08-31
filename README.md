# Node.js Build UI

A user-friendly desktop application for managing and automating build, test, and deployment tasks for multiple Node.js applications. Built with React, TypeScript, and designed to run as an Electron app for seamless local development workflows.

## Features

- **Project Dashboard:** View all your configured Node.js applications in one clean interface.
- **Configurable Projects:** Easily add new projects by specifying a name and local directory path.
- **One-Click Automation:** Run predefined commands like `git pull`, `npm install`, `npm run build`, and `npm test` with a single click.
- **Real-time Output:** View the real-time output of any running command in a detailed log viewer.
- **Status Indicators:** Instantly see the status (idle, running, success, error) of each command for each project.
- **Built-in Documentation:** Access functional and technical manuals directly within the app.
- **Live Logging Panel:** A collapsible panel displays application-level logs (DEBUG, INFO, WARNING, ERROR) with filtering capabilities.
- **Persistent Configuration:** Your list of applications is saved locally, so you don't have to reconfigure it on every launch.

## Tech Stack

- **UI Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** esbuild
- **Desktop Framework:** Electron
- **Styling:** Tailwind CSS

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
    This command will first build the production assets and then package them into a Windows installer (`.exe`) located in the `dist` folder.
    ```bash
    npm run package:win
    ```

## How to Use

1.  Launch the application.
2.  Click the "Add App" button.
3.  Fill in the application name and select the project's root directory on your local machine.
4.  The new application will appear on the dashboard as a card.
5.  On the card, you can click the "play" icon next to any command to execute it.
6.  Click the terminal icon to view the detailed log output for a specific command.