import React, { useEffect, useState } from 'react';
import readYAMLFile from './readYAMLFile';
import CardManager from '../../types/CardManager';
import StateManager from '../../types/StateManager';

export interface YAMLData {
  side_bar_file?: any;
  parts_list?: any[];
}

const cardListInstance = new CardManager();

const YAMLFileSelector: React.FC = () => {
  const [yamlData, setYamlData] = useState<YAMLData | null>(null);

  useEffect(() => {
    // Initialize parts based on parts_list
    if (yamlData?.parts_list) {
      yamlData.parts_list.forEach((obj: any) => {
        cardListInstance.addCard(obj);
      });
    }

    if (yamlData?.side_bar_file) {
      StateManager.getInstance().setSidebarFile(yamlData.side_bar_file);
    }
  }, [yamlData?.parts_list, yamlData?.side_bar_file]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      try {
        const data = await readYAMLFile(selectedFile);
        setYamlData(data);
      } catch (error: any) {
        console.error(error.message);
      }
    }

    // Reset the file input so it can trigger again even if the same file is selected
    event.target.value = '';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const selectedFile = event.dataTransfer.files?.[0];

    if (selectedFile) {
      try {
        const data = await readYAMLFile(selectedFile);
        setYamlData(data);
      } catch (error: any) {
        console.error(error.message);
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    overflowX: 'auto',
    margin: '0 auto', // Center the content
  };

  return (
    <div>
      {/* File Selector */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          margin: '20px 0',
        }}
      >
        <p>Drag and drop a YAML file here or click to select</p>

        {/* Hidden file input */}
        <input
          id="yaml_file_input"
          type="file"
          accept=".yaml, .yml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Button to trigger file input */}
        <button
          onClick={() => {
            const fileInput = document.querySelector(
              '#yaml_file_input',
            ) as HTMLInputElement | null;
            if (fileInput) {
              fileInput.click();
            }
          }}
        >
          Select File
        </button>
      </div>
    </div>
  );
};

export default YAMLFileSelector;
