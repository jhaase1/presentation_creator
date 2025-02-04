import React, { useState, useEffect } from 'react';
import SidebarFileSelector from './SidebarFileSelector';
import OutputFileSelector from './OutputFileSelector';
import TemplateFileSelector from './TemplateFileSelector';
import BackupFolderSelector from './BackupFolderSelector';

const FileSelectors: React.FC = () => {
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const buttonHeight = 60;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        maxHeight: `${windowHeight - 4 * buttonHeight}px`,
      }}
    >
      {/* File Selector Component */}
      <SidebarFileSelector />

      {/* Output Selector Component */}
      <OutputFileSelector />

      {/* Template Selector Component */}
      <TemplateFileSelector />

      {/* Backup Folder Selector Component */}
      <BackupFolderSelector />
    </div>
  );
};

export default FileSelectors;
