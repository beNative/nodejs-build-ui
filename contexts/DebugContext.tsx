import React, { createContext, useState, useContext, ReactNode, useCallback, SetStateAction } from 'react';

export interface RenderEvent {
    id: string;
    timestamp: Date;
    componentName: string;
    event: 'mount' | 'unmount' | 'render';
}

interface DebugContextType {
    isDebugPanelOpen: boolean;
    setDebugPanelOpen: React.Dispatch<SetStateAction<boolean>>;
    appState: any;
    setAppState: (state: any) => void;
    renderEvents: RenderEvent[];
    addRenderEvent: (event: Omit<RenderEvent, 'id' | 'timestamp'>) => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDebugPanelOpen, setDebugPanelOpen] = useState(false);
    const [appState, setAppState] = useState<any>({});
    const [renderEvents, setRenderEvents] = useState<RenderEvent[]>([]);

    const addRenderEvent = useCallback((event: Omit<RenderEvent, 'id' | 'timestamp'>) => {
        const newEvent: RenderEvent = {
            ...event,
            id: crypto.randomUUID(),
            timestamp: new Date(),
        };
        setRenderEvents(prev => [...prev, newEvent].slice(-100)); // Keep last 100 events
    }, []);

    const value = {
        isDebugPanelOpen,
        setDebugPanelOpen,
        appState,
        setAppState,
        renderEvents,
        addRenderEvent,
    };

    return <DebugContext.Provider value={value}>{children}</DebugContext.Provider>;
};

export const useDebug = (): DebugContextType => {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebug must be used within a DebugProvider');
    }
    return context;
};
