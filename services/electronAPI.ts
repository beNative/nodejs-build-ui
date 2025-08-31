
import type { ElectronAPI, CommandStatus, CommandUpdateData } from '../types';

// This is a mock implementation of the Electron API.
// In a real Electron app, this functionality would be handled by the main process
// and exposed to the renderer process via a preload script.

type CommandUpdateCallback = (data: CommandUpdateData) => void;

const listeners: CommandUpdateCallback[] = [];

const mockCommands: { [key: string]: string[] } = {
    'git pull': [
        'Fetching origin',
        'From https://github.com/example/repo',
        ' * branch            main       -> FETCH_HEAD',
        'Already up to date.'
    ],
    'npm install': [
        'up to date, audited 250 packages in 2s',
        '29 packages are looking for funding',
        '  run `npm fund` for details',
        'found 0 vulnerabilities'
    ],
    'npm run build': [
        '> my-app@1.0.0 build',
        '> tsc',
        'Build successful!',
        'Done in 5.32s.'
    ],
    'npm test': [
        '> my-app@1.0.0 test',
        '> jest',
        'PASS  ./__tests__/utils.test.js',
        'Test Suites: 1 passed, 1 total',
        'Tests:       1 passed, 1 total',
        'Snapshots:   0 total',
        'Time:        1.234 s',
        'Ran all test suites.'
    ]
};

const electronAPIMock: ElectronAPI = {
    selectDirectory: async () => {
        // In Electron, this would open a native file dialog.
        alert("In a real Electron app, this would open a native folder selection dialog. Returning a mock path.");
        return Promise.resolve('/Users/dev/Projects/my-cool-app');
    },

    runCommand: (appId, commandId, path, script) => {
        console.log(`Running command: "${script}" in path: "${path}" for app: ${appId}`);
        const notify = (status: CommandStatus, output: string) => {
            listeners.forEach(listener => listener({ appId, commandId, status, output }));
        };

        notify('running' as CommandStatus, `> ${script}\n`);

        let fullOutput = `> ${script}\n`;
        const outputLines = mockCommands[script] || ['Command not mocked. Simulating failure.'];
        const isSuccess = !!mockCommands[script];
        
        let lineIndex = 0;

        const interval = setInterval(() => {
            if (lineIndex < outputLines.length) {
                const line = outputLines[lineIndex] + '\n';
                fullOutput += line;
                notify('running' as CommandStatus, fullOutput);
                lineIndex++;
            } else {
                clearInterval(interval);
                const finalStatus = isSuccess ? 'success' : 'error';
                notify(finalStatus as CommandStatus, fullOutput);
            }
        }, 500);
    },

    onCommandUpdate: (callback: CommandUpdateCallback) => {
        listeners.push(callback);
        // Return an unsubscribe function
        return () => {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    },
};

export default electronAPIMock;
