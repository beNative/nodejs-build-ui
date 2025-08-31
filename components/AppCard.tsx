
import React from 'react';
import type { AppConfig, Command } from '../types';
import { CommandStatus } from '../types';
import { FolderIcon, TerminalIcon, PlayIcon, CheckCircleIcon, XCircleIcon, SpinnerIcon, TrashIcon } from './Icons';
import electronAPI from '../services/electronAPI';


interface AppCardProps {
    app: AppConfig;
    onViewLogs: (command: Command) => void;
    onDeleteApp: (appId: string) => void;
}

const AppCard: React.FC<AppCardProps> = ({ app, onViewLogs, onDeleteApp }) => {
    const runCommand = (command: Command) => {
        if (command.status === CommandStatus.RUNNING) return;
        electronAPI.runCommand(app.id, command.id, app.path, command.script);
    };

    const getStatusIcon = (status: CommandStatus) => {
        switch (status) {
            case CommandStatus.RUNNING:
                return <SpinnerIcon className="w-5 h-5 text-blue-400" />;
            case CommandStatus.SUCCESS:
                return <CheckCircleIcon className="w-5 h-5 text-green-400" />;
            case CommandStatus.ERROR:
                return <XCircleIcon className="w-5 h-5 text-red-400" />;
            default:
                return <PlayIcon className="w-5 h-5 text-gray-400 group-hover:text-white" />;
        }
    };
    
    return (
        <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col transition-all hover:shadow-2xl hover:scale-[1.02]">
            <header className="p-4 border-b border-gray-700 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-white">{app.name}</h3>
                    <div className="flex items-center mt-1 text-sm text-gray-400">
                        <FolderIcon className="w-4 h-4 mr-2" />
                        <span className="font-mono">{app.path}</span>
                    </div>
                </div>
                <button 
                    onClick={() => onDeleteApp(app.id)}
                    className="text-gray-500 hover:text-red-500 p-1 rounded-full transition-colors"
                    aria-label="Delete App"
                >
                    <TrashIcon className="w-5 h-5"/>
                </button>
            </header>
            <main className="p-4 space-y-2 flex-grow">
                {app.commands.map(command => (
                    <div key={command.id} className="flex items-center justify-between bg-gray-700/50 rounded-md p-2">
                        <span className="font-semibold">{command.name}</span>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => onViewLogs(command)}
                                className="text-gray-400 hover:text-white transition-colors"
                                title="View Logs"
                            >
                                <TerminalIcon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => runCommand(command)}
                                disabled={command.status === CommandStatus.RUNNING}
                                className="group p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                                title={`Run "${command.script}"`}
                            >
                                {getStatusIcon(command.status)}
                            </button>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
};

export default AppCard;
