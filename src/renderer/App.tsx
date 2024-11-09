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
    <div style={{ display: 'flex' }}>
      {/* Column 1 */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        <h1>St. Mary of the Hills presentation creator</h1>
        {/* File Selector Component */}
        <FileSelector onFileSelect={handleFileSelect} />
      </div>
      {/* Column 2 */}
      <div style={{ flex: 1, marginRight: '20px' }}>
        {/* Render the CardList component */}
        <CardList/>
      </div>
      {/* Column 3 */}
      <div style={{ flex: 1 }}>
        {/* Copy Slides Button */}
        <CopySlidesButton />

        {/* YAML Content Component */}
        <YAMLContent yamlData={yamlData} />
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
