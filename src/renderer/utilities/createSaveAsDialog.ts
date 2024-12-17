type FileFilter = {
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

export { showSaveDialog, FileFilter };
