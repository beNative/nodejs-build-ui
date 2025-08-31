
import React from 'react';
import type { Command } from '../types';

interface CommandOutputModalProps {
    isOpen: boolean;
    onClose: () => void;
    command: Command | null;
    appName: string;
}

const CommandOutputModal: React.FC<CommandOutputModalProps> = ({ isOpen, onClose, command, appName }) => {
    if (!isOpen || !command) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-3/4 flex flex-col">
                <header className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                        Log: <span className="font-mono text-blue-400">{appName} / {command.name}</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </header>
                <main className="p-4 overflow-y-auto flex-grow bg-gray-900">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{command.output || 'No output yet.'}</pre>
                </main>
                <footer className="p-2 border-t border-gray-700 text-right">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition-colors"
                    >
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default CommandOutputModal;
