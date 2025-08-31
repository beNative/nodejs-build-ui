
import type { ElectronAPI, Settings } from '../types';

export const isElectron = !!window.electronAPI;

let api: ElectronAPI;

if (isElectron) {
    console.log('Successfully connected to Electron backend API.');
    api = window.electronAPI;
} else {
    console.warn(
        'Electron API not found. Running in browser mode. Backend features will be mocked.'
    );

    const mockAPI: ElectronAPI = {
        selectDirectory: async () => {
            console.warn('selectDirectory mock called.');
            alert('Directory selection is only available when running in Electron.');
            return null;
        },
        runCommand: (appId, commandId, path, script) => {
            console.warn(`runCommand mock called for script: "${script}"`);
            alert(`In a real app, this would run: "${script}"`);
        },
        onCommandUpdate: (callback) => {
            console.warn('onCommandUpdate mock listener registered.');
            return () => {
                console.warn('onCommandUpdate mock listener unregistered.');
            };
        },
        getMarkdownContent: async (filename: string) => {
            console.warn(`getMarkdownContent mock called for: ${filename}`);
            return `# Mock Content\n\nThis document (\`${filename}\`) cannot be loaded from the filesystem in browser mode. Please run the application in Electron to see the real content.`;
        },
        loadSettings: async (): Promise<Settings> => {
            console.warn('loadSettings mock called. Returning default settings.');
            return { autoSaveLog: false };
        },
        saveSettings: async (settings: Settings) => {
            console.warn('saveSettings mock called with:', settings);
            // In browser mode, we could save to localStorage as a fallback if desired.
        },
        saveLogToFile: async (logContent: string) => {
            // This would spam the console, so we can keep it quiet.
        },
    };

    api = mockAPI;
}

export default api;
