import React, { Component } from 'react';
import { TemplateFileManager } from './TemplateFileManager';

class TemplateFileSelector extends Component {
  state = {
    templateFile: '' as string, // Store file name as a string (empty string for no file)
  };

  componentDidMount() {
    const fileManager = TemplateFileManager.getInstance();
    this.updateFile = this.updateFile.bind(this);
    fileManager.onFileChange(this.updateFile);

    // Initialize the state with the file manager's current file string
    this.setState({ templateFile: fileManager.getTemplateFile() });
  }

  componentWillUnmount() {
    const fileManager = TemplateFileManager.getInstance();
    fileManager.offFileChange(this.updateFile);
  }

  updateFile() {
    const fileManager = TemplateFileManager.getInstance();
    const fileString = fileManager.getTemplateFile(); // Expecting a string (file path or name)

    // Update the state with the file string
    this.setState({ templateFile: fileString });
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const fileName = file.path; // Get the file name (string)
      TemplateFileManager.getInstance().setTemplateFile(fileName); // Pass the string to TemplateFileManager
    } else {
      alert('Please select a valid PowerPoint (.pptx) file.');
    }
  };

  handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
      const fileName = file.path; // Get the file name (string)
      TemplateFileManager.getInstance().setTemplateFile(fileName); // Pass the string to TemplateFileManager
    } else {
      alert('Please select a valid PowerPoint (.pptx) file.');
    }
  };

  render() {
    const { templateFile } = this.state;

    return (
      <div
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          margin: '20px 0',
          textAlign: 'center',
        }}
      >
        <p>Template PowerPoint</p>
        <input
          type="file"
          accept=".pptx"
          id="template-input"
          style={{ display: 'none' }}
          onChange={this.handleFileChange}
        />
        <div
          style={{
            border: '2px solid #428bca',
            borderRadius: '5px',
            backgroundColor: '#f0f0f0',
            padding: '10px',
            margin: '10px',
            textAlign: 'left',
          }}
          onClick={() => document.getElementById('template-input')?.click()}
        >
          {templateFile ? (
            templateFile
          ) : (
            <span style={{ color: '#999' }}>Drag and drop a PowerPoint (.pptx) file here, or click to select</span>
          )}
        </div>
      </div>
    );
  }
}

export default TemplateFileSelector;
