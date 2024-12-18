import { Card, initializeCard } from '../renderer/elements/Card';

export interface CardList {
  cards: Card[];
}

const defaultProps: CardList = {
  cards: [],
};

class CardManager {
  private static instance: CardManager | null = null;

  private state: CardList;

  private listeners: (() => void)[] = [];

  constructor(props: CardList = defaultProps) {
    this.state = props;

    if (CardManager.instance) {
      return CardManager.instance;
    }

    CardManager.instance = this;
  }

  static getInstance(): CardManager {
    if (!CardManager.instance) {
      CardManager.instance = new CardManager();
    }
    return CardManager.instance;
  }

  addListener(listener: () => void) {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  addCard = async (options: Partial<Card> = {}) => {
    const newCard = await initializeCard(options);
    this.state.cards = [...this.state.cards, newCard];
    this.notifyListeners();
  };

  deleteCard = (id: string) => {
    this.state.cards = this.state.cards.filter((card) => card.id !== id);
    this.notifyListeners();
  };

  moveCard = (fromIndex: number, toIndex: number) => {
    const cards = [...this.state.cards];
    const [removed] = cards.splice(fromIndex, 1);
    cards.splice(toIndex, 0, removed);
    this.state.cards = cards;
    this.notifyListeners();
  };

  setBlankSlide = (id: string, blankSlide: boolean) => {
    this.state.cards = this.state.cards.map((card) =>
      card.id === id ? { ...card, blankSlide } : card,
    );
    this.notifyListeners();
  };

  setUseSidebar = (id: string, useSidebar: boolean) => {
    this.state.cards = this.state.cards.map((card) =>
      card.id === id ? { ...card, useSidebar } : card,
    );
    this.notifyListeners();
  };

  setFile = (id: string, file: string) => {
    this.state.cards = this.state.cards.map((card) =>
      card.id === id ? { ...card, file } : card,
    );
    this.notifyListeners();
  };

  getCards = (): Card[] => {
    return this.state.cards;
  };
}

export default CardManager;
