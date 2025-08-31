import React, { useState, useEffect, useCallback } from 'react';
import type { AppConfig, Command, CommandUpdateData, Settings } from './types';
import { LogLevel } from './types';
import AppCard from './components/AppCard';
import AddAppModal from './components/AddAppModal';
import CommandOutputModal from './components/CommandOutputModal';
import electronAPI from './services/electronAPI';
import { PlusIcon, AppIcon, InfoIcon } from './components/Icons';
import { useLogger } from './contexts/LoggerContext';
import LoggingPanel from './components/LoggingPanel';
import StatusBar from './components/StatusBar';
import InfoTab from './components/InfoTab';


type AppTab = 'apps' | 'info';

const App: React.FC = () => {
    const [apps, setApps] = useState<AppConfig[]>([]);
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [logModalData, setLogModalData] = useState<{ appName: string; command: Command } | null>(null);
    const [activeTab, setActiveTab] = useState<AppTab>('apps');
    const { addLog, setSettings, settings } = useLogger();

    // Load initial data (apps and settings)
    useEffect(() => {
        addLog(LogLevel.INFO, 'Application starting up...');
        
        // Load settings
        electronAPI.loadSettings().then(loadedSettings => {
            setSettings(loadedSettings);
            addLog(LogLevel.DEBUG, `Settings loaded: ${JSON.stringify(loadedSettings)}`);
        }).catch(error => {
            console.error("Failed to load settings", error);
            addLog(LogLevel.ERROR, `Failed to load settings: ${error}`);
        });

        // Load apps
        try {
            addLog(LogLevel.DEBUG, "Attempting to load apps from localStorage.");
            const savedApps = localStorage.getItem('node-build-ui-apps');
            if (savedApps) {
                setApps(JSON.parse(savedApps));
                addLog(LogLevel.INFO, 'Successfully loaded saved app configurations.');
            } else {
                addLog(LogLevel.INFO, 'No saved app configurations found.');
            }
        } catch (error) {
            console.error("Failed to load apps from localStorage", error);
            addLog(LogLevel.ERROR, `Failed to load apps from localStorage: ${error}`);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Persist apps to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('node-build-ui-apps', JSON.stringify(apps));
            addLog(LogLevel.DEBUG, 'App configurations saved to localStorage.');
        } catch (error) {
            console.error("Failed to save apps to localStorage", error);
            addLog(LogLevel.ERROR, `Failed to save apps to localStorage: ${error}`);
        }
    }, [apps, addLog]);


    const handleCommandUpdate = useCallback((data: CommandUpdateData) => {
        let appName = '';
        let commandName = '';

        setApps(prevApps =>
            prevApps.map(app => {
                if (app.id === data.appId) {
                    appName = app.name;
                    return {
                        ...app,
                        commands: app.commands.map(cmd => {
                            if (cmd.id === data.commandId) {
                                commandName = cmd.name;
                                if (cmd.status !== data.status) { // Log only on status change
                                    if(data.status === 'success' || data.status === 'error'){
                                        const logLevel = data.status === 'success' ? LogLevel.INFO : LogLevel.ERROR;
                                        addLog(logLevel, `Command "${cmd.script}" for app "${app.name}" finished with status: ${data.status.toUpperCase()}.`);
                                    }
                                }
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
                 return {
                    appName: appName || prevData.appName,
                    command: { ...prevData.command, status: data.status, output: data.output }
                };
            }
            return prevData;
        });

    }, [addLog]);

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
        const appToDelete = apps.find(app => app.id === appId);
        if (appToDelete && window.confirm(`Are you sure you want to delete "${appToDelete.name}"?`)) {
            setApps(prevApps => prevApps.filter(app => app.id !== appId));
            addLog(LogLevel.INFO, `Removed application: "${appToDelete.name}".`);
        }
    };

    const handleViewLogs = (appName: string, command: Command) => {
        setLogModalData({ appName, command });
    };

    const TabButton = ({ tab, icon, children }: { tab: AppTab, icon: React.ReactNode, children: React.ReactNode }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700'
            }`}
        >
            {icon}
            {children}
        </button>
    )

    return (
        <div className="h-screen w-screen bg-gray-900 text-white flex flex-col">
            <div className="flex-grow flex flex-col overflow-y-hidden">
                <div className="container mx-auto px-8 pt-8 flex flex-col flex-grow">
                    <header className="flex justify-between items-center mb-6 flex-shrink-0">
                        <div className="flex items-center">
                            <h1 className="text-3xl font-bold mr-8">Node.js Build UI</h1>
                            <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg">
                                <TabButton tab="apps" icon={<AppIcon className="w-5 h-5 mr-2" />}>Apps</TabButton>
                                <TabButton tab="info" icon={<InfoIcon className="w-5 h-5 mr-2" />}>Info</TabButton>
                            </div>
                        </div>
                       {activeTab === 'apps' && (
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors font-semibold"
                            >
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add App
                            </button>
                       )}
                    </header>

                    <main className="flex-grow overflow-y-auto pb-8">
                        {activeTab === 'apps' ? (
                            apps.length > 0 ? (
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
                            )
                        ) : (
                            <InfoTab />
                        )}
                    </main>
                </div>
            </div>

            <LoggingPanel />
            <StatusBar appCount={apps.length} />

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
