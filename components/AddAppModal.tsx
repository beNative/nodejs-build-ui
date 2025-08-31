import React, { useState } from 'react';
import type { AppConfig, Command } from '../types';
import { CommandStatus, LogLevel } from '../types';
import electronAPI from '../services/electronAPI';
import { FolderIcon } from './Icons';
import { useLogger } from '../contexts/LoggerContext';

interface AddAppModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddApp: (app: AppConfig) => void;
}

const defaultCommands: Omit<Command, 'id'>[] = [
    { name: 'Git Pull', script: 'git pull', status: CommandStatus.IDLE, output: '' },
    { name: 'NPM Install', script: 'npm install', status: CommandStatus.IDLE, output: '' },
    { name: 'NPM Build', script: 'npm run build', status: CommandStatus.IDLE, output: '' },
    { name: 'NPM Test', script: 'npm test', status: CommandStatus.IDLE, output: '' },
];

const AddAppModal: React.FC<AddAppModalProps> = ({ isOpen, onClose, onAddApp }) => {
    const [appName, setAppName] = useState('');
    const [appPath, setAppPath] = useState('');
    const { addLog } = useLogger();

    if (!isOpen) return null;

    const handleSelectDirectory = async () => {
        const path = await electronAPI.selectDirectory();
        if (path) {
            setAppPath(path);
            if (!appName) {
                const derivedName = path.split(/[\\/]/).pop() || '';
                setAppName(derivedName);
                addLog(LogLevel.DEBUG, `Auto-filled app name to "${derivedName}" from path.`);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!appName || !appPath) {
            alert('Please fill in both app name and path.');
            addLog(LogLevel.WARNING, 'Add app form submission failed: missing name or path.');
            return;
        }

        const newApp: AppConfig = {
            id: crypto.randomUUID(),
            name: appName,
            path: appPath,
            commands: defaultCommands.map(cmd => ({ ...cmd, id: crypto.randomUUID() })),
        };
        onAddApp(newApp);
        addLog(LogLevel.INFO, `New application added: "${appName}"`);
        setAppName('');
        setAppPath('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg">
                <form onSubmit={handleSubmit}>
                    <header className="p-4 border-b border-gray-700">
                        <h2 className="text-xl font-semibold">Add New App</h2>
                    </header>
                    <main className="p-6 space-y-4">
                        <div>
                            <label htmlFor="appName" className="block text-sm font-medium text-gray-300 mb-1">App Name</label>
                            <input
                                type="text"
                                id="appName"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="my-cool-app"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="appPath" className="block text-sm font-medium text-gray-300 mb-1">App Path</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    id="appPath"
                                    value={appPath}
                                    onChange={(e) => setAppPath(e.target.value)}
                                    className="flex-grow bg-gray-900 border border-gray-700 rounded-l-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="/path/to/your/app"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={handleSelectDirectory}
                                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-md flex items-center justify-center"
                                >
                                    <FolderIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </main>
                    <footer className="p-4 bg-gray-800 border-t border-gray-700 rounded-b-lg flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">Add App</button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AddAppModal;
