async function createSettingsDirectory(dirname: string): Promise<string> {
  try {
    const mainPromise =
      await window.electron.ipcRenderer.createSettingsDir(dirname);
  } catch (error) {
    console.error(error);
    return '';
  }
  return mainPromise.then(
    (response: string) => {
      console.log('Success!', response);
      return response;
    },
    (error: string) => {
      console.error('Failed!', error);
      return '';
    },
  );
}

export default createSettingsDirectory;
