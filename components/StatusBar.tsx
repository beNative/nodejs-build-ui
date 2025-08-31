import React, { useState, useEffect } from 'react';
import { useDebug } from '../contexts/DebugContext';
import { BugIcon } from './Icons';

interface StatusBarProps {
    appCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ appCount }) => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const { isDebugPanelOpen, setDebugPanelOpen } = useDebug();

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <footer className="flex-shrink-0 bg-gray-900 border-t border-gray-700 px-4 py-1 text-xs text-gray-400 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button
                    onClick={() => setDebugPanelOpen(!isDebugPanelOpen)}
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded transition-colors ${
                        isDebugPanelOpen 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-700'
                    }`}
                >
                    <BugIcon className="w-4 h-4" />
                    <span>Debug</span>
                </button>
                 <span className="h-4 border-l border-gray-600"></span>
                <span>Apps Configured: <span className="font-semibold text-white">{appCount}</span></span>
                <span className="h-4 border-l border-gray-600"></span>
                <div className="flex items-center">
                    <span>Local API: </span>
                    <span className="flex items-center ml-1 font-semibold text-green-400">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                        Connected
                    </span>
                </div>
            </div>
            <div>
                <span>{currentTime.toLocaleString()}</span>
            </div>
        </footer>
    );
};

export default StatusBar;