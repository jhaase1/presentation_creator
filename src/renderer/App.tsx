import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import CopySlidesButton from './elements/CopySlides';
import CardListVisual from './elements/CardListVisual';
import FileSelectors from './elements/FileSelectors';

//
function Hello() {
  return (
    <div>
      <header className="header">
        <h1>St. Mary of the Hills Presentation Creator</h1>
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
          <FileSelectors />

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
