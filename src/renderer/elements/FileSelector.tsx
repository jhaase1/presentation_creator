import React from 'react';
import readYAMLFile from './readYAMLFile';

interface FileSelectorProps {
  onFileSelect: (data: any) => void; // Adjust 'any' to the appropriate type of data
  id: string; // Add a unique `id` prop
}

const FileSelector: React.FC<FileSelectorProps> = ({ onFileSelect, id }) => {
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      try {
        const data = await readYAMLFile(selectedFile);
        onFileSelect(data);
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
        onFileSelect(data);
      } catch (error: any) {
        console.error(error.message);
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

        {/* Hidden file input with dynamic `id` and `key` */}
        <input
          key={`yaml_file_${id}`}  // Dynamic key using a unique id
          id={`yaml_file_${id}`}    // Dynamic id to ensure uniqueness
          type="file"
          accept=".yaml, .yml"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Button to trigger file input */}
        <button
          onClick={() => {
            const fileInput = document.querySelector(`#yaml_file_${id}`) as HTMLInputElement | null;
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

export default FileSelector;
