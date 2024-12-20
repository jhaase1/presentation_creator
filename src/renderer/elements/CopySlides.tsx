import StateManager from '../types/StateManager';

function CopySlidesButton() {
  const insertAllSlides = async () => {
    try {
      const state = StateManager.getInstance();

      // state.exportStateAsYaml(
      //   'C:/Users/haas1/programming/presentation_creator/state.yaml',
      // );

      const fileNameList: string[] = state.getCards().flatMap((card) => {
        if (card.file === null) {
          return [];
        }
        return card.file;
      });

      const templateFile = state.getTemplateFile();
      const newImage = state.getSidebarFile();
      const outputFile = state.getOutputFile();

      const result = await window.electron.ipcRenderer.HandlePresentationTasks(
        fileNameList,
        templateFile,
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
