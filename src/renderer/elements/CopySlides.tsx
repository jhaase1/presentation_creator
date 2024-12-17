import React from 'react';
import CardList from './CardList';
import { StateManager } from './StateManager';

const cardListInstance = new CardList();

function CopySlidesButton() {
  async function addSlidesToPresentationInMain(
    fileNameList: string[],
    templateFile: string,
    outputFile: string,
  ) {
    try {
      const result = await window.electron.ipcRenderer.AddSlidesToPresentation(
        fileNameList,
        templateFile,
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

  async function switchSideBannerInMain(
    pptxFile: string,
    originalImage: string,
    newImage: string,
  ) {
    try {
      const result = await window.electron.ipcRenderer.SwitchSideBanner(
        pptxFile,
        originalImage,
        newImage,
      );

      if (result.status === 'success') {
        console.log('Side banner switched successfully');
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
      const filenames: string[] = parts.flatMap((part) => {
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

      await addSlidesToPresentationInMain(filenames, templateFile, outputFile);
      await switchSideBannerInMain(outputFile, originalImage, sidebarFile);

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
