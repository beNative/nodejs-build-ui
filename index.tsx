import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LoggerProvider } from './contexts/LoggerContext';

console.log('index.tsx: Script start. Preparing to render React application.');

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Fatal: Could not find root element to mount to. Ensure an element with id='root' exists in your index.html.");
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LoggerProvider>
      <App />
    </LoggerProvider>
  </React.StrictMode>
);

console.log('index.tsx: React application has been mounted to the root element.');
