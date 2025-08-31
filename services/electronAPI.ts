import type { ElectronAPI, Settings, CommandUpdateData } from '../types';
import { LogLevel, LogChannel } from '../types';

// This queue will store log messages generated from this module before the logger context is ready.
// The LoggerProvider will drain this queue once it mounts.
export const ipcLogQueue: { level: LogLevel, message: string }[] = [];

const isElectron = !!window.electronAPI;

let rawApi: ElectronAPI;

if (isElectron) {
    ipcLogQueue.push({ level: LogLevel.INFO, message: 'Successfully connected to Electron backend API.' });
    rawApi = window.electronAPI;
} else {
    ipcLogQueue.push({ level: LogLevel.WARNING, message: 'Electron API not found. Running in browser mode. Backend features will be mocked.' });

    rawApi = {
        selectDirectory: async () => {
            alert('Directory selection is only available when running in Electron.');
            return null;
        },
        runCommand: (appId, commandId, path, script) => {
            alert(`In a real app, this would run: "${script}"`);
        },
        onCommandUpdate: (callback) => {
            return () => {};
        },
        getMarkdownContent: async (filename: string) => {
            return `# Mock Content\n\nThis document (\`${filename}\`) cannot be loaded from the filesystem in browser mode. Please run the application in Electron to see the real content.`;
        },
        loadSettings: async (): Promise<Settings> => ({ autoSaveLog: false }),
        saveSettings: async (settings: Settings) => {},
        saveLogToFile: async (logContent: string) => {},
    };
}

// Over-engineered Proxy to intercept and log ALL interactions with the backend API
const apiProxy = new Proxy(rawApi, {
    get(target, prop, receiver) {
        const original = target[prop as keyof ElectronAPI];

        if (typeof original === 'function') {
            return function(...args: any[]) {
                // Special handling for the listener, which we don't want to log every single update for.
                if (prop === 'onCommandUpdate') {
                    ipcLogQueue.push({ level: LogLevel.DEBUG, message: `IPC Listener Registered: onCommandUpdate` });
                    
                    const originalCallback = args[0] as (data: CommandUpdateData) => void;
                    const wrappedCallback = (data: CommandUpdateData) => {
                         ipcLogQueue.push({ 
                            level: LogLevel.DEBUG, 
                            message: `IPC Event Received: onCommandUpdate -> Status: ${data.status}, Output: ${data.output.length} chars` 
                        });
                        originalCallback(data);
                    }
                    const unsubscribe = original.apply(target, [wrappedCallback]);
                    return () => {
                        ipcLogQueue.push({ level: LogLevel.DEBUG, message: `IPC Listener Unregistered: onCommandUpdate` });
                        unsubscribe();
                    };
                }

                ipcLogQueue.push({ 
                    level: LogLevel.DEBUG, 
                    message: `IPC Call: ${String(prop)}()` + (args.length > 0 ? ` with args: ${JSON.stringify(args)}` : '') 
                });

                const result = original.apply(target, args);

                if (result instanceof Promise) {
                    return result.then(response => {
                        ipcLogQueue.push({ level: LogLevel.DEBUG, message: `IPC Response for ${String(prop)}(): ${JSON.stringify(response)}` });
                        return response;
                    }).catch(error => {
                        ipcLogQueue.push({ level: LogLevel.ERROR, message: `IPC Error in ${String(prop)}(): ${error}` });
                        throw error;
                    });
                }
                
                ipcLogQueue.push({ level: LogLevel.DEBUG, message: `IPC Sync Call Return for ${String(prop)}()` });
                return result;
            };
        }
        return original;
    },
});

export default apiProxy as ElectronAPI;