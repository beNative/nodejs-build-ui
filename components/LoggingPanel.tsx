import React, { useState, useRef, useEffect } from 'react';
import { useLogger } from '../contexts/LoggerContext';
import { LogLevel } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon, InfoIcon, XCircleIcon } from './Icons';

const LogLevelIndicator: React.FC<{ level: LogLevel }> = ({ level }) => {
    const baseClasses = "w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0";
    const colors: Record<LogLevel, string> = {
        [LogLevel.DEBUG]: 'bg-green-500',
        [LogLevel.INFO]: 'bg-blue-500',
        [LogLevel.WARNING]: 'bg-orange-500',
        [LogLevel.ERROR]: 'bg-red-500',
    };
    return <div className={`${baseClasses} ${colors[level]}`} title={level}></div>;
};

const LoggingPanel: React.FC = () => {
    const { logMessages, clearLogs, settings, setSettings } = useLogger();
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeFilters, setActiveFilters] = useState<Set<LogLevel>>(new Set(Object.values(LogLevel)));
    const scrollRef = useRef<HTMLDivElement>(null);

    const toggleFilter = (level: LogLevel) => {
        const newFilters = new Set(activeFilters);
        if (newFilters.has(level)) {
            newFilters.delete(level);
        } else {
            newFilters.add(level);
        }
        setActiveFilters(newFilters);
    };

    const handleAutoSaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, autoSaveLog: e.target.checked });
    };

    const filteredLogs = logMessages.filter(log => activeFilters.has(log.level));

    useEffect(() => {
        if (isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLogs, isExpanded]);

    const logLevelColors: Record<LogLevel, { bg: string, text: string, hover: string }> = {
        [LogLevel.DEBUG]: { bg: 'bg-green-600/20', text: 'text-green-400', hover: 'hover:bg-green-600/40' },
        [LogLevel.INFO]: { bg: 'bg-blue-600/20', text: 'text-blue-400', hover: 'hover:bg-blue-600/40' },
        [LogLevel.WARNING]: { bg: 'bg-orange-600/20', text: 'text-orange-400', hover: 'hover:bg-orange-600/40' },
        [LogLevel.ERROR]: { bg: 'bg-red-600/20', text: 'text-red-400', hover: 'hover:bg-red-600/40' },
    }

    return (
        <div className="flex-shrink-0 border-t-2 border-gray-700 bg-gray-800 text-sm">
            <header 
                className="flex items-center justify-between p-2 cursor-pointer hover:bg-gray-700/50"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    <h3 className="font-bold text-gray-300">Application Logs</h3>
                    <span className="ml-2 bg-gray-700 text-xs font-semibold px-2 py-0.5 rounded-full">{filteredLogs.length}</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-gray-400">
                        {isExpanded ? 'Click to Collapse' : 'Click to Expand'}
                    </span>
                    {isExpanded ? <ChevronDownIcon className="w-5 h-5"/> : <ChevronUpIcon className="w-5 h-5"/>}
                </div>
            </header>
            
            {isExpanded && (
                <div className="border-t border-gray-700">
                    <div className="p-2 flex items-center justify-between bg-gray-900/50">
                        <div className="flex items-center space-x-1">
                            <span className="mr-2 font-semibold">Filters:</span>
                            {Object.values(LogLevel).map(level => (
                                <button 
                                    key={level}
                                    onClick={(e) => { e.stopPropagation(); toggleFilter(level); }}
                                    className={`px-3 py-1 rounded-md text-xs transition-colors ${logLevelColors[level].text} ${activeFilters.has(level) ? logLevelColors[level].bg : 'opacity-40 hover:opacity-100'} ${logLevelColors[level].hover}`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={settings.autoSaveLog} onChange={handleAutoSaveChange} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                                <span>Auto-save log to file</span>
                            </label>
                            <button onClick={(e) => { e.stopPropagation(); clearLogs(); }} className="flex items-center text-gray-400 hover:text-white">
                                <TrashIcon className="w-4 h-4 mr-1" />
                                Clear
                            </button>
                        </div>
                    </div>
                    <div ref={scrollRef} className="h-48 overflow-y-auto bg-gray-900 p-2 font-mono text-xs">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="flex items-start">
                                <span className="text-gray-500 mr-2 flex-shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                                <LogLevelIndicator level={log.level} />
                                <span className="flex-grow whitespace-pre-wrap">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoggingPanel;
