import type { ElectronAPI, CommandStatus, CommandUpdateData, Settings } from '../types';

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

const mockDocs: Record<string, string> = {
    'README.md': '## Mock README\n\nThis is the content of README.md loaded from the backend.',
    'FUNCTIONAL_MANUAL.md': '## Mock Functional Manual\n\nThis is the content of FUNCTIONAL_MANUAL.md.',
    'TECHNICAL_MANUAL.md': '## Mock Technical Manual\n\nThis is the content of TECHNICAL_MANUAL.md.',
    'VERSION_LOG.md': '## Mock Version Log\n\n- **v1.1.0:** Added cool new features.\n- **v1.0.0:** Initial release.'
};

const electronAPIMock: ElectronAPI = {
    selectDirectory: async () => {
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

    getMarkdownContent: async (filename: string): Promise<string> => {
        console.log(`Fetching markdown for: ${filename}`);
        // In real electron, this would be: `fs.readFileSync(path.join(__dirname, filename), 'utf-8')`
        // We will also add a small delay to simulate file reading
        await new Promise(resolve => setTimeout(resolve, 300));
        return Promise.resolve(mockDocs[filename] || `# Error: ${filename} not found.`);
    },

    loadSettings: async (): Promise<Settings> => {
        console.log("Loading settings...");
        // In a real app, this would read from a JSON file.
        const mockSettings: Settings = { autoSaveLog: false };
        try {
            const storedSettings = localStorage.getItem('node-build-ui-settings');
            return storedSettings ? JSON.parse(storedSettings) : mockSettings;
        } catch (e) {
            return mockSettings;
        }
    },

    saveSettings: async (settings: Settings): Promise<void> => {
        console.log("Saving settings:", settings);
        // In a real app, this would write to a JSON file.
        localStorage.setItem('node-build-ui-settings', JSON.stringify(settings));
        return Promise.resolve();
    },

    saveLogToFile: async (logContent: string): Promise<void> => {
        // In a real app, this would append to or create a log file.
        // E.g. fs.appendFileSync('nodejs-build-ui-YYYY-MM-DD.log', logContent);
        console.log("--- Pretending to save log to file ---");
        console.log(logContent);
        console.log("--------------------------------------");
        return Promise.resolve();
    }
};

export default electronAPIMock;
