import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLogger } from '../contexts/LoggerContext';
import { LogLevel, LogChannel } from '../types';
import { ChevronDownIcon, ChevronUpIcon, TrashIcon } from './Icons';

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
    const [activeChannel, setActiveChannel] = useState<LogChannel | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleAutoSaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, autoSaveLog: e.target.checked });
    };

    const filteredLogs = useMemo(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        return logMessages.filter(log => 
            (activeChannel === 'ALL' || log.channel === activeChannel) &&
            (lowerCaseSearch === '' || log.message.toLowerCase().includes(lowerCaseSearch))
        );
    }, [logMessages, activeChannel, searchTerm]);

    useEffect(() => {
        if (isExpanded && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [filteredLogs, isExpanded]);

    const channelColors: Record<LogChannel, string> = {
        [LogChannel.APP]: 'border-b-blue-500',
        [LogChannel.SYSTEM]: 'border-b-purple-500',
        [LogChannel.IPC]: 'border-b-teal-500',
    }

    const ChannelButton: React.FC<{ channel: LogChannel | 'ALL' }> = ({ channel }) => {
        const count = channel === 'ALL' ? logMessages.length : logMessages.filter(l => l.channel === channel).length;
        return (
            <button
                onClick={(e) => { e.stopPropagation(); setActiveChannel(channel); }}
                className={`px-3 py-1 text-xs font-semibold border-b-2 transition-colors ${
                    activeChannel === channel
                        ? 'text-white ' + (channel !== 'ALL' ? channelColors[channel] : 'border-b-gray-200')
                        : 'text-gray-400 border-b-transparent hover:text-white'
                }`}
            >
                {channel} <span className="text-gray-500">{count}</span>
            </button>
        )
    };

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
                    <div className="p-2 flex items-center justify-between bg-gray-900/50 space-x-4">
                        <div className="flex items-center space-x-2">
                           <ChannelButton channel="ALL" />
                           <ChannelButton channel={LogChannel.APP} />
                           <ChannelButton channel={LogChannel.SYSTEM} />
                           <ChannelButton channel={LogChannel.IPC} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            className="bg-gray-700 text-xs rounded-md px-2 py-1 flex-grow max-w-sm border border-transparent focus:border-blue-500 focus:ring-0"
                        />
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2 cursor-pointer text-xs">
                                <input type="checkbox" checked={settings.autoSaveLog} onChange={handleAutoSaveChange} className="form-checkbox bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500"/>
                                <span>Auto-save</span>
                            </label>
                            <button onClick={(e) => { e.stopPropagation(); clearLogs(); }} className="flex items-center text-gray-400 hover:text-white text-xs">
                                <TrashIcon className="w-4 h-4 mr-1" />
                                Clear
                            </button>
                        </div>
                    </div>
                    <div ref={scrollRef} className="h-48 overflow-y-auto bg-gray-900 p-2 font-mono text-xs">
                        {filteredLogs.map(log => (
                            <div key={log.id} className="flex items-start hover:bg-gray-700/50 rounded px-1">
                                <span className="text-gray-500 mr-2 flex-shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                                <LogLevelIndicator level={log.level} />
                                <span className="text-gray-400 font-bold mr-2">[{log.channel}]</span>
                                <span className="flex-grow whitespace-pre-wrap text-gray-300">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LoggingPanel;