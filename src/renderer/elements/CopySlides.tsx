import React from 'react';
import CardList from './CardList';
import { StateManager } from './StateManager';

const cardListInstance = new CardList();

export function CopySlidesButton() {
  const insertAllSlides = async () => {
    try {
      const parts = cardListInstance.getCards();
      const filenames: string[] = parts.flatMap((part) => {
        if (part.file === null) {
          return [];
        }
        return part.file;
      });

      const templateFile = StateManager.getInstance().getTemplateFile();

      await addSlidesToPresentationInMain(filenames, templateFile);
    } catch (error) {
      console.error('Filenames not determined, error:', error);
    }
  };

  async function addSlidesToPresentationInMain(
    file_name_list: string[],
    templateFile: string,
  ) {
    try {
      const result = await window.electron.ipcRenderer.AddSlidesToPresentation(
        file_name_list,
        templateFile,
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

  return (
    <div>
      <button onClick={insertAllSlides} style={{ marginTop: '16px' }}>
        Copy Slides to Presentation
      </button>
    </div>
  );
}
