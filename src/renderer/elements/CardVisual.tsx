/* eslint-disable react/function-component-definition */
import React, { useEffect, useRef, useState } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import ItemTypes from '../types/ItemTypes';
import StateManager from '../types/StateManager';
import Card from '../types/Card';

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

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer.files?.[0];
    if (
      droppedFile &&
      droppedFile.type ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      card.setFile(droppedFile.path);
    }
  };

  return (
    <div
      ref={cardRef}
      onDragOver={(e) => e.preventDefault()} // Allow dragging over
      onDrop={handleDrop} // Handle file drops
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '8px',
        padding: '8px',
        margin: '8px',
        backgroundColor: isOver ? '#c9c9c9' : '#e0e0e0',
      }}
    >
      <div style={{ display: 'grid', gap: '8px' }}>
        <label
          htmlFor={`fileInput-${card.getID()}`}
          style={{
            cursor: 'pointer',
            padding: '8px',
            border: '2px solid #428bca',
            borderRadius: '5px',
          }}
        >
          {file || 'Select File'}
          <input
            key={`fileInput-${card.getID()}`}
            id={`fileInput-${card.getID()}`}
            type="file"
            accept=".pptx"
            style={{ display: 'none' }}
            onChange={(e) => {
              const newFile = e.target.files?.[0];
              if (newFile) card.setFile(newFile.path);
            }}
          />
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
        style={{
          color: 'white',
          backgroundColor: '#d9534f',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        x
      </button>
    </div>
  );
};

export default CardVisual;
