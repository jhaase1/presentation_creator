// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
    AddSlidesToPresentation: async (
      file_name_list: string[],
      templateFile: string,
      outputFile: string,
    ) => {
      const result = await ipcRenderer.invoke(
        'AddSlidesToPresentation',
        file_name_list,
        templateFile,
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
    SwitchSideBanner: async (
      pptxFile: string,
      originalImage: string,
      newImage: string,
    ) => {
      const result = await ipcRenderer.invoke(
        'SwitchSideBanner',
        pptxFile,
        originalImage,
        newImage,
      );

      return result;
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
