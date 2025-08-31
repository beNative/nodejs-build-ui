
import React, { useState, useEffect, useCallback } from 'react';
import type { AppConfig, Command, CommandUpdateData } from './types';
import AppCard from './components/AppCard';
import AddAppModal from './components/AddAppModal';
import CommandOutputModal from './components/CommandOutputModal';
import electronAPI from './services/electronAPI';
import { PlusIcon } from './components/Icons';

const App: React.FC = () => {
    const [apps, setApps] = useState<AppConfig[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [logModalData, setLogModalData] = useState<{ appName: string; command: Command } | null>(null);

    useEffect(() => {
        try {
            const savedApps = localStorage.getItem('node-build-ui-apps');
            if (savedApps) {
                setApps(JSON.parse(savedApps));
            }
        } catch (error) {
            console.error("Failed to load apps from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('node-build-ui-apps', JSON.stringify(apps));
        } catch (error) {
            console.error("Failed to save apps to localStorage", error);
        }
    }, [apps]);

    const handleCommandUpdate = useCallback((data: CommandUpdateData) => {
        setApps(prevApps =>
            prevApps.map(app => {
                if (app.id === data.appId) {
                    return {
                        ...app,
                        commands: app.commands.map(cmd => {
                            if (cmd.id === data.commandId) {
                                return { ...cmd, status: data.status, output: data.output };
                            }
                            return cmd;
                        }),
                    };
                }
                return app;
            })
        );

        // Also update the log modal if it's open for the command that just updated
        setLogModalData(prevData => {
            if (prevData && prevData.command.id === data.commandId) {
                const app = apps.find(a => a.id === data.appId);
                if(app){
                    return {
                        appName: app.name,
                        command: { ...prevData.command, status: data.status, output: data.output }
                    };
                }
            }
            return prevData;
        });

    }, [apps]);

    useEffect(() => {
        const unsubscribe = electronAPI.onCommandUpdate(handleCommandUpdate);
        return () => {
            unsubscribe();
        };
    }, [handleCommandUpdate]);

    const handleAddApp = (newApp: AppConfig) => {
        setApps(prevApps => [...prevApps, newApp]);
    };
    
    const handleDeleteApp = (appId: string) => {
        if(window.confirm("Are you sure you want to delete this app configuration?")) {
            setApps(prevApps => prevApps.filter(app => app.id !== appId));
        }
    };

    const handleViewLogs = (appName: string, command: Command) => {
        setLogModalData({ appName, command });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="container mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold">Node.js Build UI</h1>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors font-semibold"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Add App
                    </button>
                </header>

                {apps.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {apps.map(app => (
                            <AppCard
                                key={app.id}
                                app={app}
                                onViewLogs={(command) => handleViewLogs(app.name, command)}
                                onDeleteApp={handleDeleteApp}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-800 rounded-lg">
                        <h2 className="text-2xl font-semibold text-gray-300">No applications configured.</h2>
                        <p className="text-gray-400 mt-2">Click "Add App" to get started.</p>
                    </div>
                )}
            </div>

            <AddAppModal
                isOpen={isAddModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAddApp={handleAddApp}
            />

            <CommandOutputModal
                isOpen={!!logModalData}
                onClose={() => setLogModalData(null)}
                command={logModalData?.command || null}
                appName={logModalData?.appName || ''}
            />
        </div>
    );
};

export default App;
