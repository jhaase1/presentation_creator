import React, { useRef } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { v4 as uuidv4 } from 'uuid';

const ItemTypes = {
  CARD: 'card',
};

interface CardProps {
  card: CardData;
  index: number;
  setFile: (id: string, filePath: string) => void;
  setUseSidebar: (id: string, useSidebar: boolean) => void;
  setBlankSlide: (id: string, blankSlide: boolean) => void;
  moveCard: (fromIndex: number, toIndex: number) => void;
  deleteCard: (id: string) => void;
}

interface CardData {
  id: string;
  file: string | null;
  useSidebar: boolean;
  blankSlide: boolean;
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

export const initializeCard = async (options: {
  file?: string | null;
  useSidebar?: boolean;
  blankSlide?: boolean;
} = {}): Promise<CardData> => {
  const { file = null, useSidebar = false, blankSlide = true } = options;

  const id = uuidv4();

  const newCard: CardData = {
    id,
    file,
    useSidebar,
    blankSlide,
  };

  return newCard;
};

const Card: React.FC<CardProps> = ({
  card,
  index,
  setFile,
  setUseSidebar,
  setBlankSlide,
  moveCard,
  deleteCard,
}) => {
  const { id, file, useSidebar, blankSlide } = card;

  const [, ref] = useDrag({
    type: ItemTypes.CARD,
    item: { id, index },
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover: (item: { id: string; index: number }, monitor: DropTargetMonitor) => {
      if (item.index !== index) {
        moveCard(item.index, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const fileInputChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = event.target.files && event.target.files[0];
    if (newFile) {
      setFile(id, newFile.path);
    }
  };

  const handleUseSidebarChange = () => {
    setUseSidebar(id, !useSidebar);
  };

  const handleBlankSlideChange = () => {
    setBlankSlide(id, !blankSlide);
  };

  return (
    <div
      key={id}
      ref={(node) => {
        ref(drop(node));
      }}
      onDragOver={(e) => e.preventDefault()}
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
          {file ? file : 'Select File'}
          <input
            key={`fileInput-${id}`}
            id={`fileInput-${id}`}
            type="file"
            accept=".pptx"
            style={{ display: 'none' }}
            onChange={fileInputChangeHandler}
          />
        </label>

        <label style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          <input
            key={`useSidebar-${id}`}
            type="checkbox"
            checked={useSidebar}
            onChange={handleUseSidebarChange}
          />
          Use Sidebar
        </label>

        <label style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
          <input
            key={`blankSlide-${id}`}
            type="checkbox"
            checked={blankSlide}
            onChange={handleBlankSlideChange}
          />
          Insert blank slide after
        </label>
      </div>
      <div>
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
    </div>
  );
};

export default Card;
