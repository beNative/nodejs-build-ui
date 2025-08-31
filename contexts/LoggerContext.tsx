import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import type { LogMessage, Settings } from '../types';
import { LogLevel } from '../types';
import electronAPI from '../services/electronAPI';

interface LoggerContextType {
    logMessages: LogMessage[];
    addLog: (level: LogLevel, message: string) => void;
    clearLogs: () => void;
    settings: Settings;
    setSettings: (settings: Settings) => void;
}

const LoggerContext = createContext<LoggerContextType | undefined>(undefined);

export const LoggerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [logMessages, setLogMessages] = useState<LogMessage[]>([]);
    const [settings, setSettingsState] = useState<Settings>({ autoSaveLog: false });

    const addLog = useCallback((level: LogLevel, message: string) => {
        const newLog: LogMessage = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            level,
            message,
        };
        setLogMessages(prevLogs => [...prevLogs, newLog]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogMessages([]);
    }, []);

    const setSettings = useCallback((newSettings: Settings) => {
        setSettingsState(newSettings);
        electronAPI.saveSettings(newSettings);
        addLog(LogLevel.DEBUG, `Settings updated: ${JSON.stringify(newSettings)}`);
    }, [addLog]);

    useEffect(() => {
        // This effect handles auto-saving logs when the setting is enabled.
        // It saves the most recent log message.
        if (settings.autoSaveLog && logMessages.length > 0) {
            const lastLog = logMessages[logMessages.length - 1];
            const logLine = `[${lastLog.timestamp.toISOString()}] [${lastLog.level}] ${lastLog.message}\n`;
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
