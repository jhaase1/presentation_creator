// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { FileFilter } from '../renderer/utilities/createSaveAsDialog';
import StateManager from '../renderer/types/StateManager';

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
    mergePresentations: async (
      fileNameList: string[],
      templateFile: string,
      newImage: string,
      outputFile: string,
    ) => {
      const result = await ipcRenderer.invoke(
        'merge-presentations',
        fileNameList,
        templateFile,
        newImage,
        outputFile,
      );

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
    writeTextFile: async (filePath: string, contents: string) => {
      const result = await ipcRenderer.invoke(
        'write-text-file',
        filePath,
        contents,
      );

      return result;
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
