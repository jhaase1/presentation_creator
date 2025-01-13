// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { FileFilter } from '../renderer/utilities/createDialogs';
import path from 'node:path';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    mergePresentations: async (yamlState: string) => {
      const result = await ipcRenderer.invoke('merge-presentations', yamlState);

      return result;
    },
    showSaveDialog: async (defaultPath: string, filters: FileFilter) => {
      const result = await ipcRenderer.invoke(
        'show-save-dialog',
        defaultPath,
        filters,
      );

      return result;
    },
    showOpenDialog: async (options: object) => {
      const result = await ipcRenderer.invoke('show-open-dialog', options);

      return result;
    },
    writeTextFile: async (filePath: string, contents: string) => {
      const result = await ipcRenderer.invoke(
        'write-text-file',
        filePath,
        contents,
      );

      return result;
    },
    readTextFile: async (filePath: string) => {
      const result = await ipcRenderer.invoke('read-text-file', filePath);

      return result;
    },
    getAppSettings: async () => {
      const result = await ipcRenderer.invoke('get-app-settings');
      return result;
    },
    setAppSettings: async (settings: object) => {
      const result = await ipcRenderer.invoke('set-app-settings', settings);
      return result;
    },
    pathParse: async (p: string) => {
      const result = await ipcRenderer.invoke('path-parse', p);
      return result;
    },
    pathFormat: async (pathObject: object) => {
      const result = await ipcRenderer.invoke('path-format', pathObject);
      return result;
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
