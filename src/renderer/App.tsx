import React, { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import icon from '../../assets/icon.svg';
import './App.css';

import FileSelector from './elements/FileSelector';
import YAMLContent, { YAMLData } from './elements/YAMLContent';
import { CopySlidesButton } from './elements/CopySlides';
import CardList from './elements/CardList';

function Hello() {
  const [yamlData, setYamlData] = useState<YAMLData | null>(null);

  const handleFileSelect = (data: YAMLData) => {
    setYamlData(data);
  };

  return (

<div>
  <header className="header">
    <h1>St. Mary of the Hills presentation creator</h1>
  </header>
  <div className="main-content">
    {/* Column 1 */}
    <div className="column column-wide">
      {/* Render the CardList component */}
      <CardList />
    </div>
    {/* Combined Column */}
    <div className="column column-narrow">
      {/* File Selector Component */}
      <FileSelector id="yaml_input" onFileSelect={handleFileSelect} />

      {/* Spacing between components */}
      <div className="spacing"></div>

      {/* Copy Slides Button */}
      <CopySlidesButton />

      {/* YAML Content Component */}
      <YAMLContent yamlData={yamlData} />
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
