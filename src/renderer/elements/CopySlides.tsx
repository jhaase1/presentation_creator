import StateManager from '../types/StateManager';
import { dump, writeTextFile } from '../utilities/yamlFunctions';

function CopySlidesButton() {
  const insertAllSlides = async () => {
    try {
      const state = StateManager.getInstance();
      const yamlState = dump(state);

      const outputFile = state.getOutputFile();
      const backupFolder = state.getBackupFolder();

      let result = null;

      if (outputFile === null) {
        console.error('Output file file not set');
        return;
      }

      result = await window.electron.ipcRenderer.pathParse(outputFile);
      const outputFileObject =
        result.status === 'success' ? result.value : null;

      if (outputFileObject === null) {
        console.error('Output file path not valid');
        return;
      }

      if (backupFolder === null) {
        console.error('Backup folder not set');
      } else {
        result = await window.electron.ipcRenderer.pathFormat({
          dir: backupFolder,
          name: outputFileObject.name,
          ext: '.yaml',
        });

        const yamlFilePath = result.status === 'success' ? result.value : null;

        if (yamlFilePath === null) {
          console.error('Error formatting YAML file path');
        } else {
          result = writeTextFile(yamlFilePath, yamlState);
        }
      }

      result = await window.electron.ipcRenderer.mergePresentations(yamlState);

      if (result.status === 'success') {
        console.log('Slides added successfully');
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('IPC invocation error:', error);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={insertAllSlides}
        style={{ marginTop: '16px' }}
      >
        Copy Slides to Presentation
      </button>
    </div>
  );
}

export default CopySlidesButton;
