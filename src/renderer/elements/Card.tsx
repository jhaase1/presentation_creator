import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';
import jsyaml from 'js-yaml';

const ItemTypes = {
  CARD: 'card',
};

export interface Card {
  id: string;
  file: string | null;
  useSidebar: boolean;
  blankSlide: boolean;
}

export const cardYAMLType = new jsyaml.Type('!Card', {
  kind: 'mapping',
  construct: (data) => ({
    file: data.file,
    useSidebar: data.useSidebar,
    blankSlide: data.blankSlide,
  }),
  instanceOf: Object,
  represent: (card: Card) => ({
    file: card.file,
    useSidebar: card.useSidebar,
    blankSlide: card.blankSlide,
  }),
});

interface CardProps {
  card: Card;
  index: number;
  setFile: (id: string, filePath: string) => void;
  setUseSidebar: (id: string, useSidebar: boolean) => void;
  setBlankSlide: (id: string, blankSlide: boolean) => void;
  moveCard: (fromIndex: number, toIndex: number) => void;
  deleteCard: (id: string) => void;
}

const getTitleOrBasename = (part: any, filename: string | null): string => {
  if (typeof filename !== 'string') {
    return part.title;
  }

  const parts = filename.split(/[\\/]/);
  const basename = parts[parts.length - 1];
  const name = basename.split('.').slice(0, -1).join('.');

  return !part.title || part.title.trim() === '' ? name : part.title;
};

export const initializeCard = async (
  options: {
    file?: string | null;
    useSidebar?: boolean;
    blankSlide?: boolean;
  } = {},
): Promise<Card> => {
  const { file = null, useSidebar = false, blankSlide = true } = options;

  const id = uuidv4();

  const newCard: Card = {
    id,
    file,
    useSidebar,
    blankSlide,
  };

  return newCard;
};

const CardVisual: React.FC<CardProps> = ({
  card,
  index,
  setFile,
  setUseSidebar,
  setBlankSlide,
  moveCard,
  deleteCard,
}) => {
  const { id, file, useSidebar, blankSlide } = card;

  const cardRef = useRef<HTMLDivElement>(null);

  // Drag functionality
  const [, drag] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index },
  });

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (
      item: { id: string; index: number },
      monitor: DropTargetMonitor,
    ) => {
      if (item.index !== index) {
        moveCard(item.index, index);
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
      // Handle file drop
      setFile(id, droppedFile.path);
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
          htmlFor={`fileInput-${id}`}
          style={{
            cursor: 'pointer',
            padding: '8px',
            border: '2px solid #428bca',
            borderRadius: '5px',
          }}
        >
          {file || 'Select File'}
          <input
            key={`fileInput-${id}`}
            id={`fileInput-${id}`}
            type="file"
            accept=".pptx"
            style={{ display: 'none' }}
            onChange={(e) => {
              const newFile = e.target.files?.[0];
              if (newFile) setFile(id, newFile.path);
            }}
          />
        </label>

        <label>
          <input
            type="checkbox"
            checked={useSidebar}
            onChange={() => setUseSidebar(id, !useSidebar)}
          />
          Use Sidebar
        </label>

        <label>
          <input
            type="checkbox"
            checked={blankSlide}
            onChange={() => setBlankSlide(id, !blankSlide)}
          />
          Insert blank slide after
        </label>
      </div>
      <button
        onClick={() => deleteCard(id)}
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
