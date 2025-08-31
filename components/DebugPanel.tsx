import React, { useState, useEffect, useRef } from 'react';
import { useDebug } from '../contexts/DebugContext';
import { useLogger } from '../contexts/LoggerContext';
import { LogChannel, LogLevel } from '../types';
import { EyeIcon, WrenchScrewdriverIcon, TrashIcon, BugIcon, XCircleIcon } from './Icons';

type DebugTab = 'state' | 'profiler' | 'actions';

const DraggableHeader: React.FC<{ children: React.ReactNode, onDrag: (dx: number, dy: number) => void }> = ({ children, onDrag }) => {
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        lastPos.current = { x: e.clientX, y: e.clientY };
    };
    
    const onMouseMove = (e: MouseEvent) => {
        if (!isDragging.current) return;
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        lastPos.current = { x: e.clientX, y: e.clientY };
        onDrag(dx, dy);
    };
    
    const onMouseUp = () => {
        isDragging.current = false;
    };
    
    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onDrag]);

    return (
        <header onMouseDown={onMouseDown} className="p-2 bg-gray-700 cursor-move flex justify-between items-center rounded-t-lg">
            {children}
        </header>
    );
};

const DebugPanel: React.FC = () => {
    const { appState, renderEvents, setDebugPanelOpen } = useDebug();
    const { addLog } = useLogger();
    const [activeTab, setActiveTab] = useState<DebugTab>('state');
    const [position, setPosition] = useState({ x: 30, y: 30 });
    const scrollRef = useRef<HTMLDivElement>(null);

    const handleDrag = (dx: number, dy: number) => {
        setPosition(p => ({ x: p.x + dx, y: p.y + dy }));
    };

    const handleClearLocalStorage = () => {
        if (window.confirm('Are you sure you want to delete all app configurations? This cannot be undone.')) {
            localStorage.clear();
            addLog(LogChannel.APP, LogLevel.WARNING, 'Local storage cleared by debug panel.');
            window.location.reload();
        }
    }
    
    const handleTestError = () => {
        addLog(LogChannel.APP, LogLevel.WARNING, 'Intentionally throwing error to test ErrorBoundary.');
        throw new Error('This is a test error from the Debug Panel!');
    }

    useEffect(() => {
        // Auto-scroll the profiler
        if (activeTab === 'profiler' && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [renderEvents, activeTab]);

    const TabButton: React.FC<{ tab: DebugTab, icon: React.ReactNode, children: React.ReactNode }> = ({ tab, icon, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center space-x-2 px-3 py-1 text-xs rounded-md ${
                activeTab === tab ? 'bg-purple-600 text-white' : 'hover:bg-gray-600'
            }`}
        >
            {icon}<span>{children}</span>
        </button>
    )

    return (
        <div 
            className="fixed bg-gray-800 border-2 border-purple-500 rounded-lg shadow-2xl w-[450px] h-[600px] flex flex-col z-50 text-white"
            style={{ top: `${position.y}px`, left: `${position.x}px` }}
        >
            <DraggableHeader onDrag={handleDrag}>
                <div className="flex items-center space-x-2">
                    <BugIcon className="w-5 h-5 text-purple-300" />
                    <h2 className="font-bold">Debug Panel</h2>
                </div>
                <button onClick={() => setDebugPanelOpen(false)} className="text-gray-400 hover:text-white">
                    <XCircleIcon className="w-6 h-6"/>
                </button>
            </DraggableHeader>
            <nav className="p-1 flex-shrink-0 bg-gray-900/50 flex items-center justify-center space-x-2">
                <TabButton tab="state" icon={<EyeIcon className="w-4 h-4"/>}>State</TabButton>
                <TabButton tab="profiler" icon={<WrenchScrewdriverIcon className="w-4 h-4"/>}>Profiler</TabButton>
                <TabButton tab="actions" icon={<TrashIcon className="w-4 h-4"/>}>Actions</TabButton>
            </nav>
            <main className="flex-grow overflow-y-auto">
                {activeTab === 'state' && (
                    <pre className="p-2 text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(appState, null, 2)}
                    </pre>
                )}
                {activeTab === 'profiler' && (
                    <div ref={scrollRef} className="h-full overflow-y-auto p-1 font-mono text-xs">
                        {renderEvents.map(event => (
                            <div key={event.id} className="flex items-center">
                                <span className="text-gray-500 mr-2">{event.timestamp.toLocaleTimeString()}</span>
                                <span className={`mr-2 font-bold ${event.event === 'mount' ? 'text-green-400' : event.event === 'unmount' ? 'text-red-400' : 'text-blue-400'}`}>
                                    [{event.event.toUpperCase()}]
                                </span>
                                <span>{event.componentName}</span>
                            </div>
                        ))}
                    </div>
                )}
                {activeTab === 'actions' && (
                    <div className="p-4 space-y-4">
                        <div className="bg-gray-700/50 p-3 rounded-md">
                            <h3 className="font-bold mb-2">Storage Actions</h3>
                             <button onClick={handleClearLocalStorage} className="w-full px-3 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-md">
                                Clear Local Storage & Reload
                            </button>
                        </div>
                        <div className="bg-gray-700/50 p-3 rounded-md">
                            <h3 className="font-bold mb-2">Error Handling</h3>
                             <button onClick={handleTestError} className="w-full px-3 py-2 text-sm bg-orange-600 hover:bg-orange-700 rounded-md">
                                Test Error Boundary
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default DebugPanel;
