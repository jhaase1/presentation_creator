import jsyaml from 'js-yaml';
import Card, { cardYAMLType } from './Card';

interface iStateManager {
  templateFile: string | null;
  sidebarFile: string | null;
  outputFile: string | null;
  cards: Card[];
}

class StateManager {
  private static instance: StateManager;

  private templateFile: string | null = null;

  private sidebarFile: string | null = null;

  private outputFile: string | null = null;

  private cards: Card[] = [];

  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  // Listener functionality
  onFileChange(listener: () => void): void {
    this.listeners.add(listener);
  }

  offFileChange(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  getTemplateFile(): string | null {
    return this.templateFile;
  }

  setTemplateFile(file: string): void {
    this.templateFile = file;
    this.notifyListeners();
  }

  getSidebarFile(): string | null {
    return this.sidebarFile;
  }

  setSidebarFile(file: string): void {
    this.sidebarFile = file;
    this.notifyListeners();
  }

  getOutputFile(): string | null {
    return this.outputFile;
  }

  setOutputFile(file: string): void {
    this.outputFile = file;
    this.notifyListeners();
  }

  addCard = (options: Partial<Card> = {}) => {
    const newCard = new Card(
      options.file,
      options.useSidebar,
      options.blankSlide,
    );
    this.cards = [...this.cards, newCard];
    this.notifyListeners();
  };

  splitCards = (index: number, ...userCards: Card[] | [Card[]]) => {
    const cards: Card[] = userCards.flat();
    this.cards.splice(index, 0, ...cards);
    this.notifyListeners();
  };

  deleteCard = (id: string) => {
    this.cards = this.cards.filter((card) => card.getID() !== id);
    this.notifyListeners();
  };

  moveCard = (fromIndex: number, toIndex: number) => {
    const cards = [...this.cards];
    const [removed] = cards.splice(fromIndex, 1);
    cards.splice(toIndex, 0, removed);
    this.cards = cards;
    this.notifyListeners();
  };

  spliceCards = (
    start: number | null = null,
    deleteCount: number = 0,
    ...userCards: Card[]
  ) => {
    const cards: Card[] = userCards.flat();

    if (start === null) {
      this.cards.push(...cards);
    } else {
      this.cards.splice(start, deleteCount, ...cards);
    }

    this.notifyListeners();
  };

  getCards = (): Card[] => {
    return this.cards;
  };

  safeUpdateState = (
    state: Partial<iStateManager>,
    cardStartIndex: number | null = null,
    cardDeleteCount: number = 0,
  ) => {
    const {
      templateFile = null,
      sidebarFile = null,
      outputFile = null,
      cards = null,
    } = state;

    if (this.templateFile === null) {
      this.templateFile = templateFile;
    }

    if (this.sidebarFile === null) {
      this.sidebarFile = sidebarFile;
    }

    if (this.outputFile === null) {
      this.outputFile = outputFile;
    }

    if (cards !== null) {
      this.spliceCards(cardStartIndex, cardDeleteCount, ...cards);
    }
  };
}

export const StateManagerYAMLType = new jsyaml.Type('!StateManager', {
  kind: 'mapping',
  instanceOf: StateManager,
  construct: (data) => ({
    templateFile: data.templateFile,
    sidebarFile: data.sidebarFile,
    outputFile: data.outputFile,
    cards: data.cards,
  }),
  represent: (state: any) => ({
    templateFile: state.getTemplateFile(),
    sidebarFile: state.getSidebarFile(),
    outputFile: state.getOutputFile(),
    cards: state.getCards(),
  }),
});

const schema = jsyaml.DEFAULT_SCHEMA.extend([
  cardYAMLType,
  StateManagerYAMLType,
]);

export default StateManager;
export { schema };
