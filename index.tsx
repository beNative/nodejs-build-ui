import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoggerProvider } from './contexts/LoggerContext';
import ErrorBoundary from './components/ErrorBoundary';
import { DebugProvider } from './contexts/DebugContext';

window.traceStartup('index.tsx: Script start.');

const rootElement = document.getElementById('root');
if (!rootElement) {
  const errorMsg = "Fatal: Could not find root element to mount to. Ensure an element with id='root' exists in your index.html.";
  window.traceStartup(`<span style="color: red;">${errorMsg}</span>`);
  console.error(errorMsg);
  throw new Error(errorMsg);
}

window.traceStartup('Root element found. Creating React root.');
const root = ReactDOM.createRoot(rootElement);

window.traceStartup('Rendering React application...');
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <LoggerProvider>
        <DebugProvider>
          <App />
        </DebugProvider>
      </LoggerProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

window.traceStartup('<span style="color: lightgreen;">React application mounted successfully.</span>');

// Hide the tracer after a successful boot.
setTimeout(() => {
  const tracer = document.getElementById('startup-tracer');
  if (tracer) {
    tracer.style.transition = 'opacity 1s';
    tracer.style.opacity = '0';
    setTimeout(() => tracer.remove(), 1000);
  }
}, 2000);