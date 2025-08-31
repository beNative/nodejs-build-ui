import { contextBridge, ipcRenderer } from 'electron';

console.log('Preload script loaded.');

const electronAPI = {
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    runCommand: (appId, commandId, path, script) => ipcRenderer.send('run-command', { appId, commandId, path, script }),
    onCommandUpdate: (callback) => {
        const listener = (event, data) => callback(data);
        ipcRenderer.on('command-update', listener);
        return () => {
            ipcRenderer.removeListener('command-update', listener);
        };
    },
    getMarkdownContent: (filename) => ipcRenderer.invoke('get-markdown-content', filename),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
    saveLogToFile: (logContent) => ipcRenderer.send('save-log-to-file', logContent),
};

try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI);
    console.log('electronAPI exposed to main world.');
} catch (error) {
    console.error('Failed to expose electronAPI:', error);
}
