import jsyaml from 'js-yaml';
import Card, { cardYAMLType } from './Card';

const schema = jsyaml.DEFAULT_SCHEMA.extend([cardYAMLType]);

class StateManager {
  private static instance: StateManager;

  private templateFile: string | null = null;

  private sidebarFile: string | null = null;

  private outputFile: string | null = null;

  private listeners: Set<() => void> = new Set();

  private cards: Card[] = [];

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

  getCards = (): Card[] => {
    return this.cards;
  };

  async exportStateAsYaml(
    filePath: string,
    options: {
      templateFile?: boolean;
      sidebarFile?: boolean;
      outputFile?: boolean;
      cardList?: boolean;
    } = {
      templateFile: true,
      sidebarFile: true,
      outputFile: true,
      cardList: true,
    },
  ): Promise<void> {
    const state: any = {};

    if (options.templateFile) {
      state.templateFile = this.templateFile;
    }
    if (options.sidebarFile) {
      state.sidebarFile = this.sidebarFile;
    }
    if (options.outputFile) {
      state.outputFile = this.outputFile;
    }
    if (options.cardList) {
      state.cards = this.cards;
    }

    const yamlStr = jsyaml.dump(state, { schema });

    await window.electron.ipcRenderer.exportYAML(filePath, yamlStr);
  }
}

export default StateManager;
