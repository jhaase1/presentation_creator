import React, { Component } from 'react';
import StateManager from '../types/StateManager';
import './FileSelector.css';

class SidebarFileSelector extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      sidebarFile: '', // Store file name as a string (empty string for no file)
    };
  }

  componentDidMount() {
    const fileManager = StateManager.getInstance();
    this.updateFile = this.updateFile.bind(this);
    fileManager.onFileChange(this.updateFile);

    // Initialize the state with the file manager's current file string
    this.setState({ sidebarFile: fileManager.getSidebarFile() });
  }

  componentWillUnmount() {
    const fileManager = StateManager.getInstance();
    fileManager.offFileChange(this.updateFile);
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const fileName = file.path; // Get the file name (string)
      StateManager.getInstance().setSidebarFile(fileName); // Pass the string to StateManager
    }
  };

  handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fileName = file.path; // Get the file name (string)
      StateManager.getInstance().setSidebarFile(fileName); // Pass the string to StateManager
    }
  };

  updateFile() {
    const fileManager = StateManager.getInstance();
    const sidebarFile = fileManager.getSidebarFile();
    this.setState({ sidebarFile: sidebarFile });

    document.getElementById("sidebar-input").value = "";
  }

  render() {
    const { sidebarFile } = this.state;

    return (
      <div
        onDragOver={this.handleDragOver}
        onDrop={this.handleDrop}
        className="file-selector-container"
      >
        <p className="file-selector-label">Sidebar image</p>
        <input
          type="file"
          accept="image/*"
          id="sidebar-input"
          className="file-selector-input"
          onChange={this.handleFileChange}
        />
        <div
          className="file-selector-dropzone"
          onClick={() => document.getElementById('sidebar-input')?.click()}
        >
          {sidebarFile || (
            <span className="file-selector-placeholder">
              Drag and drop an image file here, or click to select
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default SidebarFileSelector;
