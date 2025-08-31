import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

async function createWindow() {
    console.log('Creating application window...');
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    const startUrl = path.join(__dirname, 'index.html');
    console.log(`Loading URL: file://${startUrl}`);
    mainWindow.loadFile(startUrl);

    if (process.env.NODE_ENV === 'development') {
        console.log('Opening DevTools...');
        mainWindow.webContents.openDevTools();
    }
    
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
    console.log('Window created successfully.');
}

app.on('ready', async () => {
    console.log('Electron app is ready.');
    setupIpcHandlers();
    await createWindow();
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});

function setupIpcHandlers() {
    console.log('Setting up IPC handlers.');
    ipcMain.handle('select-directory', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });
        if (result.canceled) {
            return null;
        }
        return result.filePaths[0];
    });

    ipcMain.on('run-command', (event, { appId, commandId, path: cwd, script }) => {
        const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
        const args = process.platform === 'win32' ? ['/c', script] : ['-c', script];
        
        console.log(`[${appId}:${commandId}] Running command: "${script}" in "${cwd}"`);
        const child = spawn(shell, args, { cwd, stdio: 'pipe' });
        
        event.sender.send('command-update', { appId, commandId, status: 'running', output: `> ${script}\n` });

        const sendOutput = (data) => {
             event.sender.send('command-update', { appId, commandId, status: 'running', output: data.toString() });
        };

        child.stdout.on('data', sendOutput);
        child.stderr.on('data', sendOutput);

        child.on('close', (code) => {
            const status = code === 0 ? 'success' : 'error';
            console.log(`[${appId}:${commandId}] Command finished with code ${code}. Status: ${status}`);
            event.sender.send('command-update', { appId, commandId, status, output: `\nProcess finished with exit code ${code}.\n` });
        });
        
        child.on('error', (err) => {
            console.error(`[${appId}:${commandId}] Command failed to start:`, err);
            event.sender.send('command-update', { appId, commandId, status: 'error', output: `\nFailed to start process: ${err.message}\n` });
        });
    });

    ipcMain.handle('get-markdown-content', async (event, filename) => {
        try {
            const filePath = path.join(__dirname, 'dist', filename);
            return await fs.readFile(filePath, 'utf-8');
        } catch (error) {
            console.error(`Error reading markdown file ${filename}:`, error);
            return `# Error\n\nCould not load file: ${filename}. Reason: ${error.message}`;
        }
    });

    const settingsPath = path.join(app.getPath('userData'), 'settings.json');
    ipcMain.handle('load-settings', async () => {
        try {
            const data = await fs.readFile(settingsPath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            if (error.code === 'ENOENT') {
                return { autoSaveLog: false }; // Default settings
            }
            console.error('Error loading settings:', error);
            return { autoSaveLog: false };
        }
    });
    
    ipcMain.handle('save-settings', async (event, settings) => {
        try {
            await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    });
    
    ipcMain.on('save-log-to-file', async (event, logContent) => {
        try {
            const date = new Date().toISOString().split('T')[0];
            const logFileName = `nodejs-build-ui-${date}.log`;
            const logPath = path.join(app.getPath('userData'), logFileName);
            await fs.appendFile(logPath, logContent);
        } catch(error) {
            console.error('Error saving log file:', error);
        }
    });
}
