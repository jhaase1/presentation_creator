import StateManager from '../types/StateManager';
import { dump, writeTextFile } from '../utilities/yamlFunctions';

function CopySlidesButton() {
  const insertAllSlides = async () => {
    try {
      const state = StateManager.getInstance();
      const yamlState = dump(state);

      const outputFile = state.getOutputFile();

      if (outputFile === null) {
        console.error('Output file file not set');
        return;
      }

      const yamlFile = outputFile.replace(/\.[^/.]+$/, '.yaml');

      writeTextFile(yamlFile, yamlState);

      // const fileNameList: string[] = state.getCards().flatMap((card) => {
      //   if (card.file === null) {
      //     return [];
      //   }
      //   return card.file;
      // });

      // const templateFile = state.getTemplateFile();
      // const newImage = state.getSidebarFile();
      // const outputFile = state.getOutputFile();

      const result =
        await window.electron.ipcRenderer.mergePresentations(yamlState);

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
