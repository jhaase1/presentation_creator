import React from 'react';
import readYAMLFile from './readYAMLFile';

interface FileSelectorProps {
  onFileSelect: (data: any) => void; // Adjust 'any' to the appropriate type of data
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelect }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      try {
        const data = await readYAMLFile(selectedFile);
        onFileSelect(data);
      } catch (error: any) {
        console.error(
          error.message
        );
      }
    }
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
        onFileSelect(data);
      } catch (error: any) {
        console.error(
          error.message
        );
      }
    }
  };

  return (
    <div>
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
        <input
          type="file"
          accept=".yaml, .yml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button onClick={() => (document.querySelector('input[type=file]') as HTMLInputElement | null)?.click()}>
          Select File
        </button>
      </div>
    </div>
  );
};

export default FileSelector;
