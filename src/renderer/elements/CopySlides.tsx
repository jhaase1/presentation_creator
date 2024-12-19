import CardList from './CardList';
import StateManager from './StateManager';

const cardListInstance = new CardList();

function CopySlidesButton() {
  async function OutputPresentation(
    fileNameList: string[],
    templateFile: string,
    originalImage: string,
    newImage: string,
    outputFile: string,
  ) {
    try {
      const result = await window.electron.ipcRenderer.HandlePresentationTasks(
        fileNameList,
        templateFile,
        originalImage,
        newImage,
        outputFile,
      );

      if (result.status === 'success') {
        console.log('Slides added successfully');
      } else {
        console.error('Error:', result.message);
      }
    } catch (error) {
      console.error('IPC invocation error:', error);
    }
  }

  const insertAllSlides = async () => {
    try {
      const parts = cardListInstance.getCards();
      const fileNameList: string[] = parts.flatMap((part) => {
        if (part.file === null) {
          return [];
        }
        return part.file;
      });

      const state = StateManager.getInstance();

      const templateFile = state.getTemplateFile();
      const outputFile = state.getOutputFile();
      const sidebarFile = state.getSidebarFile();

      const originalImage = 'ppt/media/image1.png';

      await OutputPresentation(
        fileNameList,
        templateFile,
        originalImage,
        sidebarFile,
        outputFile,
      );
    } catch (error) {
      console.error('Filenames not determined, error:', error);
    }
  };

  return (
    <div>
      <button onClick={insertAllSlides} style={{ marginTop: '16px' }}>
        Copy Slides to Presentation
      </button>
    </div>
  );
}

export default CopySlidesButton;
