export type FileFilter = {
  name: string;
  extensions: string[];
};

async function showSaveDialog(defaultPath: string, templateFile: FileFilter[]) {
  try {
    const result = await window.electron.ipcRenderer.showSaveDialog(
      defaultPath,
      templateFile,
    );

    return result;
  } catch (error) {
    console.error('IPC invocation error:', error);
    return null;
  }
}

async function showOpenDialog(options: object) {
  try {
    const result = await window.electron.ipcRenderer.showOpenDialog(options);

    return result;
  } catch (error) {
    console.error('IPC invocation error:', error);
    return null;
  }
}

export { showOpenDialog, showSaveDialog };
