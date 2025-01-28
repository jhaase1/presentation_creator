import React, { Component } from 'react';
import StateManager from '../types/StateManager';
import { showSaveDialog, FileFilter } from '../utilities/createDialogs';
import './FileSelector.css';

class OutputFileSelector extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      outputFile: '', // Store file name as a string (empty string for no file)
    };
  }

  componentDidMount() {
    const fileManager = StateManager.getInstance();
    this.updateFile = this.updateFile.bind(this);
    fileManager.onFileChange(this.updateFile);

    // Initialize the state with the file manager's current file string
    this.setState({ outputFile: fileManager.getOutputFile() });
  }

  componentWillUnmount() {
    const fileManager = StateManager.getInstance();
    fileManager.offFileChange(this.updateFile);
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      file.type ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const fileName = file.path; // Get the file name (string)
      StateManager.getInstance().setOutputFile(fileName); // Pass the string to StateManager
    }
  };

  handleSaveAs = async () => {
    const defaultPath = this.state.outputFile || 'output.pptx';
    const filters: FileFilter[] = [
      {
        name: 'PowerPoint Files',
        extensions: ['pptx'],
      },
    ];
    const result = await showSaveDialog(defaultPath, filters);
    if (result) {
      this.setState({ outputFile: result });
      StateManager.getInstance().setOutputFile(result);
    }
  };

  updateFile() {
    const fileManager = StateManager.getInstance();
    const fileString = fileManager.getOutputFile(); // Expecting a string (file path or name)

    // Update the state with the file string
    this.setState({ outputFile: fileString });
  }

  render() {
    const { outputFile } = this.state;

    return (
      <div className="file-selector-container">
        <p className="file-selector-label">Output PowerPoint</p>
        <div className="file-selector-dropzone" onClick={this.handleSaveAs}>
          {outputFile || (
            <span className="file-selector-placeholder">
              Drag and drop a PowerPoint (.pptx) file here, or click to select
            </span>
          )}
        </div>
      </div>
    );
  }
}

export default OutputFileSelector;
