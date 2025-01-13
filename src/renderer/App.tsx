import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import YAMLFileSelector from './elements/YAMLFileSelector';
import SidebarFileSelector from './elements/SidebarFileSelector';
import TemplateFileSelector from './elements/TemplateFileSelector';
import OutputFileSelector from './elements/OutputFileSelector';
import CopySlidesButton from './elements/CopySlides';
import CardListVisual from './elements/CardListVisual';
import BackupFolderSelector from './elements/BackupFolderSelector';

function Hello() {
  return (
    <div>
      <header className="header">
        <h1>St. Mary of the Hills presentation creator</h1>
      </header>
      <div className="main-content">
        {/* Column 1 */}
        <div className="column column-wide">
          {/* Render the CardList component */}
          <CardListVisual />
        </div>
        {/* Combined Column */}
        <div className="column column-narrow">
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

          {/* Copy Slides Button */}
          <CopySlidesButton />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
