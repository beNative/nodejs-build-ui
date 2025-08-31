# Functional Manual

This document provides a guide on how to use the Node.js Build UI application.

## 1. Main Interface

The main window is divided into three primary sections:
1.  **Main Content Area:** This is where you view and interact with your applications or read documentation.
2.  **Logging Panel:** A collapsible panel at the bottom that shows application-level logs.
3.  **Status Bar:** A bar at the very bottom displaying summary information.

### 1.1. Tabs

At the top of the main content area, you can switch between two views:
-   **Apps:** The main dashboard for managing your Node.js projects.
-   **Info:** A view for reading application documentation like this manual.

## 2. Managing Applications

### 2.1. Adding a New Application

1.  Navigate to the **Apps** tab.
2.  Click the **Add App** button in the header.
3.  A modal window will appear.
4.  **App Name:** Enter a descriptive name for your project. If you select a directory first, the name will be auto-filled.
5.  **App Path:** Click the folder icon to open a native dialog and select the root directory of your Node.js project. You can also paste the path manually.
6.  Click **Add App**. The application will now appear as a card on the dashboard.

### 2.2. Interacting with an Application Card

Each card on the dashboard represents one configured application and contains:
-   **App Name and Path:** Displayed at the top.
-   **Command List:** A list of predefined commands (e.g., 'Git Pull', 'NPM Install').

For each command, you have two actions:
-   **Run Command (Play Icon):** Executes the command script in the application's directory. The icon will change to a spinner while running, a checkmark on success, or an 'X' on failure.
-   **View Logs (Terminal Icon):** Opens a modal showing the detailed, real-time output from the last time the command was run.

### 2.3. Deleting an Application

Click the **Trash Can** icon in the top-right corner of an application card. You will be asked to confirm the deletion. This only removes the configuration from this UI; it does not affect the files on your disk.

## 3. Logging Panel

The logging panel at the bottom of the window displays internal logs from the Build UI itself.

-   **Toggle Visibility:** Click the header of the panel (where the title "Application Logs" is) or the chevron icon to collapse or expand it.
-   **Filter Logs:** Click on the log level buttons (`DEBUG`, `INFO`, `WARN`, `ERROR`) to toggle them in the view. This helps in debugging issues.
-   **Auto-save Log:** Check the "Auto-save log to file" box to automatically write all log messages to a file. The file will be named `nodejs-build-ui-YYYY-MM-DD.log` and saved in the same directory as the application executable.

## 4. Status Bar

The status bar at the bottom provides quick, at-a-glance information:
-   **Apps Configured:** The total number of applications you have added.
-   **API Status:** A mock status indicator for backend services.
-   **Current Time:** The system's current time.
