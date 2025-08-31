import type { ElectronAPI } from '../types';

console.log('Attempting to access window.electronAPI...');

const api = window.electronAPI;

if (!api) {
    const errorMessage = "electronAPI is not available on the window object. This app must be run in an Electron environment and the preload script must be correctly configured.";
    console.error(errorMessage);
    // You might want to display this error in the UI instead of throwing
    throw new Error(errorMessage);
} else {
    console.log('Successfully connected to electronAPI.');
}

const electronAPI: ElectronAPI = api;

export default electronAPI;
