/* eslint-disable react/function-component-definition */
import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { FaUpload } from 'react-icons/fa'; // Import an upload icon from react-icons

import ItemTypes from '../types/ItemTypes';
import StateManager from '../types/StateManager';
import Card from '../types/Card';
import { readYAMLFile } from '../utilities/yamlFunctions';

import '../App.css';

const stateManager = StateManager.getInstance();
interface CardProps {
  card: Card;
  index: number;
}

const CardVisual: React.FC<CardProps> = ({ card, index }) => {
  const [file, setFile] = useState(card.getFile());
  const [useSidebar, setUseSidebar] = useState(card.getUseSidebar());
  const [blankSlide, setBlankSlide] = useState(card.getBlankSlide());

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleCardChange = () => {
      setFile(card.getFile());
      setUseSidebar(card.getUseSidebar());
      setBlankSlide(card.getBlankSlide());
    };

    card.addListener(handleCardChange);

    return () => {
      card.removeListener(handleCardChange);
    };
  }, [card]);

  // Drag functionality
  const [, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id: card.getID(), index },
  });

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (
      item: { id: string; index: number },
      monitor: DropTargetMonitor,
    ) => {
      if (item.index !== index) {
        stateManager.moveCard(item.index, index);
        item.index = index;
      }
    },
    drop: (item: { id: string; index: number }, monitor: DropTargetMonitor) => {
      // Handle card-specific drop logic here if needed
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  drag(drop(cardRef)); // Combine refs for drag and drop

  async function handleFile(userFile: File | undefined) {
    if (
      userFile &&
      (userFile.type ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        userFile.type.startsWith('image/'))
    ) {
      card.setFile(userFile.path, userFile.type);
    } else if (
      userFile &&
      (userFile.path.endsWith('.yaml') || userFile.path.endsWith('.yml'))
    ) {
      // eslint-disable-next-line no-alert
      const id = card.getID();
      const cardIndex = stateManager.findCard(id);

      const data = await readYAMLFile(userFile.path);
      stateManager.safeUpdateState(data, cardIndex, 1);
    }
  }

  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    handleFile(droppedFile);
  };

  return (
    <div
      ref={cardRef}
      onDragOver={(e) => e.preventDefault()} // Allow dragging over
      onDrop={handleDrop} // Handle file drops
      className={`card-visual ${isOver ? 'is-over' : ''}`}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={{ cursor: 'grab' }}>☰</span> {/* Drag icon */}
      </div>
      <div style={{ display: 'grid', gap: '8px' }}>
        <label
          htmlFor={`fileInput-${card.getID()}`}
          className="file-selector-dropzone"
        >
          {file || 'Select a file to add to the presentation'}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              key={`fileInput-${card.getID()}`}
              id={`fileInput-${card.getID()}`}
              type="file"
              accept=".pptx,image/*,.yaml,.yml"
              style={{ display: 'none' }}
              onChange={(e) => {
                const newFile = e.target.files?.[0];
                handleFile(newFile);
              }}
            />
            <label
              htmlFor={`fileInput-${card.getID()}`}
              style={{ cursor: 'pointer', marginLeft: '10px' }}
            >
              <FaUpload size={20} />
            </label>
          </div>
        </label>

        <label htmlFor={`useSidebar-${card.getID()}`}>
          <input
            id={`useSidebar-${card.getID()}`}
            type="checkbox"
            checked={useSidebar}
            onChange={() => card.setUseSidebar(!useSidebar)}
          />
          Use Sidebar
        </label>

        <label htmlFor={`blankSlide-${card.getID()}`}>
          <input
            id={`blankSlide-${card.getID()}`}
            type="checkbox"
            checked={blankSlide}
            onChange={() => card.setBlankSlide(!blankSlide)}
          />
          Insert blank slide after
        </label>
      </div>
      <button
        type="button"
        onClick={() => stateManager.deleteCard(card.getID())}
        className="delete-button"
      />
    </div>
  );
};

export default CardVisual;
