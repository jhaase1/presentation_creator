import React, { Component } from 'react';
import { SidebarFileManager } from './SidebarFileManager';

class SidebarFileSelector extends Component {
  state = {
    sidebarFile: '' as string, // Store file name as a string (empty string for no file)
  };

  componentDidMount() {
    const fileManager = SidebarFileManager.getInstance();
    this.updateFile = this.updateFile.bind(this);
    fileManager.onFileChange(this.updateFile);

    // Initialize the state with the file manager's current file string
    this.setState({ sidebarFile: fileManager.getSidebarFile() });
  }

  componentWillUnmount() {
    const fileManager = SidebarFileManager.getInstance();
    fileManager.offFileChange(this.updateFile);
  }

  updateFile() {
    const fileManager = SidebarFileManager.getInstance();
    const fileString = fileManager.getSidebarFile(); // Expecting a string (file path or name)

    // Update the state with the file string
    this.setState({ sidebarFile: fileString });
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const fileName = file.path; // Get the file name (string)
      SidebarFileManager.getInstance().setSidebarFile(fileName); // Pass the string to SidebarFileManager
    } else {
      alert('Please select a valid image file.');
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
      SidebarFileManager.getInstance().setSidebarFile(fileName); // Pass the string to SidebarFileManager
    } else {
      alert('Please select a valid image file.');
    }
  };

  render() {
    const { sidebarFile } = this.state;

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
        <p>Sidebar image</p>
        <input
          type="file"
          accept="image/*"
          id="sidebar-input"
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
        onClick={() => document.getElementById('sidebar-input')?.click()}
      >
        {sidebarFile ? (
          sidebarFile
        ) : (
          <span style={{ color: '#999' }}>Drag and drop an image file here, or click to select</span>
        )}

       </div>
      </div>
    );
  }
}

export default SidebarFileSelector;
