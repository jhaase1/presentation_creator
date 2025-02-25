import React, { Component } from 'react';
import StateManager from '../types/StateManager';
import { showOpenDialog } from '../utilities/createDialogs';
import './FileSelector.css';
import { FaUpload } from 'react-icons/fa'; // Import the upload icon

class BackupFolderSelector extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      backupFolder: '', // Store file name as a string (empty string for no file)
    };
  }

  componentDidMount() {
    const fileManager = StateManager.getInstance();
    this.updateFile = this.updateFile.bind(this);
    fileManager.onFileChange(this.updateFile);

    // Initialize the state with the file manager's current file string
    this.setState({ backupFolder: fileManager.getBackupFolder() });
  }

  componentWillUnmount() {
    const fileManager = StateManager.getInstance();
    fileManager.offFileChange(this.updateFile);
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type.startsWith('image/')) {
      const fileName = file.path; // Get the file name (string)
      StateManager.getInstance().setBackupFolder(fileName); // Pass the string to StateManager
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
      StateManager.getInstance().setBackupFolder(fileName); // Pass the string to StateManager
    }
  };

  handleOpen = async () => {
    const options = {
      properties: ['openDirectory'],
    };
    const result = await showOpenDialog(options);
    if (result) {
      this.setState({ backupFolder: result });
      StateManager.getInstance().setBackupFolder(result);
    }
  };

  updateFile() {
    const fileManager = StateManager.getInstance();
    const backupFolder = fileManager.getBackupFolder();
    this.setState({ backupFolder });
  }

  render() {
    const { backupFolder } = this.state;

    return (
      <div className="file-selector-container">
        <p className="file-selector-label">Backup Folder</p>
        <div className="file-selector-dropzone" onClick={this.handleOpen}>
          {backupFolder || (
            <span>Drag and drop a backup folder, or click to select</span>
          )}
          <FaUpload size={20} style={{ marginLeft: '10px' }} />{' '}
          {/* Add the upload icon */}
        </div>
      </div>
    );
  }
}

export default BackupFolderSelector;
