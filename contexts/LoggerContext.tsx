import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import type { LogMessage, Settings } from '../types';
import { LogLevel, LogChannel } from '../types';
import electronAPI from '../services/electronAPI';
import { ipcLogQueue } from '../services/electronAPI';

interface LoggerContextType {
    logMessages: LogMessage[];
    addLog: (channel: LogChannel, level: LogLevel, message: string) => void;
    clearLogs: () => void;
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export const LoggerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
    const [settings, setSettingsState] = useState<Settings>({ autoSaveLog: false });

    const addLog = useCallback((channel: LogChannel, level: LogLevel, message: string) => {
        const newLog: LogMessage = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            channel,
            level,
            message,
        };
        setLogMessages(prevLogs => [...prevLogs, newLog]);
    }, []);

    // This effect drains the IPC log queue from the electronAPI service.
    // This is a robust way to get logs from a non-React module into React state.
    useEffect(() => {
        const interval = setInterval(() => {
            if (ipcLogQueue.length > 0) {
                const logsToAdd = [...ipcLogQueue];
                ipcLogQueue.length = 0; // Clear the queue
                setLogMessages(prevLogs => [
                    ...prevLogs,
                    ...logsToAdd.map(log => ({
                        id: crypto.randomUUID(),
                        timestamp: new Date(),
                        channel: LogChannel.IPC,
                        level: log.level,
                        message: log.message
                    }))
                ]);
            }
        }, 500); // Check for new IPC logs twice a second
        return () => clearInterval(interval);
    }, []);

    const clearLogs = useCallback(() => {
        setLogMessages([]);
    }, []);

    const setSettings = useCallback((newSettings: Settings) => {
        setSettingsState(newSettings);
        electronAPI.saveSettings(newSettings);
        addLog(LogChannel.APP, LogLevel.DEBUG, `Settings updated: ${JSON.stringify(newSettings)}`);
    }, [addLog]);

    useEffect(() => {
        // This effect handles auto-saving logs when the setting is enabled.
        if (settings.autoSaveLog && logMessages.length > 0) {
            const lastLog = logMessages[logMessages.length - 1];
            const logLine = `[${lastLog.timestamp.toISOString()}] [${lastLog.channel}] [${lastLog.level}] ${lastLog.message}\n`;
            electronAPI.saveLogToFile(logLine);
        }
    }, [logMessages, settings.autoSaveLog]);

    const value = {
        logMessages,
        addLog,
        clearLogs,
        settings,
        setSettings,
    };

    return <LoggerContext.Provider value={value}>{children}</LoggerContext.Provider>;
};

export const useLogger = (): LoggerContextType => {
    const context = useContext(LoggerContext);
    if (context === undefined) {
        throw new Error('useLogger must be used within a LoggerProvider');
    }
    return context;
};