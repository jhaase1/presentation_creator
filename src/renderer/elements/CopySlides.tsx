import React from 'react';
import CardList from './CardList';

const cardListInstance = new CardList();

export const CopySlidesButton = () => {

  const insertAllSlides = async () => {
    try {
      const parts = cardListInstance.getCards(); // Assuming you have a function to get parts from CardList
      let filenames: string[] = parts.flatMap(
        (part) => {
          if (part.file === null) { return []; }
          return part.file
        }
      );

      await addSlidesToPresentationInMain(filenames);

    } catch (error) {
      console.error('Filenames not determined, error:', error);
    }
  };

  async function addSlidesToPresentationInMain(file_name_list:string[]) {
    try {
      const result = await window.electron.ipcRenderer.AddSlidesToPresentation(file_name_list);
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
};
