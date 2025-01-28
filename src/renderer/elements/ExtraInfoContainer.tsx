import React, { Component } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import YAMLFileSelector from './elements/YAMLFileSelector';
import SidebarFileSelector from './elements/SidebarFileSelector';
import TemplateFileSelector from './elements/TemplateFileSelector';
import OutputFileSelector from './elements/OutputFileSelector';
import BackupFolderSelector from './elements/BackupFolderSelector';

return (
  <DndProvider backend={HTML5Backend}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        maxHeight: `${windowHeight - 4 * buttonHeight}px`,
      }}
    >
          {/* File Selector Component */}
          <YAMLFileSelector />

          {/* File Selector Component */}
          <SidebarFileSelector />

          {/* Template Selector Component */}
          <TemplateFileSelector />

          {/* Output Selector Component */}
          <OutputFileSelector />

          {/* Backup Folder Selector Component */}
          <BackupFolderSelector />
    </div>
  </DndProvider>
);
