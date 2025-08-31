
export enum CommandStatus {
  IDLE = 'idle',
  RUNNING = 'running',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface Command {
  id: string;
  name: string;
  script: string;
  status: CommandStatus;
  output: string;
}

export interface AppConfig {
  id: string;
  name: string;
  path: string;
  commands: Command[];
}

export type CommandUpdateData = {
  appId: string;
  commandId: string;
  status: CommandStatus;
  output: string;
};

export interface ElectronAPI {
  selectDirectory: () => Promise<string | null>;
  runCommand: (appId: string, commandId: string, path: string, script: string) => void;
  onCommandUpdate: (callback: (data: CommandUpdateData) => void) => () => void;
}

// In a real Electron app, the preload script would expose the API on the window object.
// To make TypeScript aware of this, you could extend the Window interface:
/*
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
*/
