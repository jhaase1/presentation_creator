import jsyaml from 'js-yaml';
import CardManager, { CardManagerYAMLType } from './CardManager';
import Card, { cardYAMLType } from './Card';

const schema = jsyaml.DEFAULT_SCHEMA.extend([
  cardYAMLType,
  CardManagerYAMLType,
]);

class StateManager {
  cards: CardManager;

  private static instance: StateManager;

  private templateFile: string | null = null;

  private sidebarFile: string | null = null;

  private outputFile: string | null = null;

  private listeners: Set<() => void> = new Set();

  private cardManager: CardManager | null = null;

  private constructor() {
    this.cards = new CardManager();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
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

  onFileChange(listener: () => void): void {
    this.listeners.add(listener);
  }

  offFileChange(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  getcardList(): CardManager | null {
    return this.cards;
  }

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
      state.cards = this.cards.getCards();
    }

    console.log("I'm here");
    const yamlStr = jsyaml.dump(state, { schema });
    console.log(yamlStr);

    await window.electron.ipcRenderer.exportYAML(filePath, yamlStr);
  }
}

export default StateManager;
