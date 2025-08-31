import { useEffect, useRef } from 'react';
import { useLogger } from '../contexts/LoggerContext';
import { useDebug } from '../contexts/DebugContext';
import { LogLevel, LogChannel } from '../types';

export const useLifecycleLogger = (componentName: string) => {
    const { addLog } = useLogger();
    const { addRenderEvent } = useDebug();
    const isMounted = useRef(false);
    const renderCount = useRef(0);

    useEffect(() => {
        if (!isMounted.current) {
            // Mount effect
            isMounted.current = true;
            addLog(LogChannel.SYSTEM, LogLevel.DEBUG, `${componentName} mounted.`);
            addRenderEvent({ componentName, event: 'mount' });
        }

        return () => {
            // Unmount effect
            isMounted.current = false;
            addLog(LogChannel.SYSTEM, LogLevel.DEBUG, `${componentName} unmounted.`);
            addRenderEvent({ componentName, event: 'unmount' });
        };
    }, [addLog, addRenderEvent, componentName]);
    
    // This effect runs on every render after the initial mount
    useEffect(() => {
        if (renderCount.current > 0) {
            addLog(LogChannel.SYSTEM, LogLevel.DEBUG, `${componentName} re-rendered (render count: ${renderCount.current}).`);
            addRenderEvent({ componentName, event: 'render' });
        }
        renderCount.current += 1;
    }); // No dependency array, so it runs on every render
};
