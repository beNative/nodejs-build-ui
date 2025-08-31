import type { ElectronAPI } from '../types';

// This file now points to the API exposed by the preload script in a real Electron environment.
// The mock is no longer needed as we have a real backend.
const api = window.electronAPI;

if (!api) {
    // This error will be thrown if the app is run in a standard browser
    // instead of the Electron wrapper.
    throw new Error("electronAPI is not available. This app must be run in an Electron environment.");
}

const electronAPI: ElectronAPI = api;

export default electronAPI;
