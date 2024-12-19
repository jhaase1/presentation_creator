import jsyaml from 'js-yaml';
import CardManager from './CardManager';

// const schema = jsyaml.DEFAULT_SCHEMA.extend([cardDataYamlType]);

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
      cardList?: boolean;
      outputFile?: boolean;
      sidebarFile?: boolean;
      templateFile?: boolean;
    } = {
      cardList: true,
      outputFile: true,
      sidebarFile: true,
      templateFile: true,
    },
  ): Promise<void> {
    const state: any = {};

    if (options.cardList) {
      state.cardList = this.cardManager;
    }
    if (options.outputFile) {
      state.outputFile = this.outputFile;
    }
    if (options.sidebarFile) {
      state.sidebarFile = this.sidebarFile;
    }
    if (options.templateFile) {
      state.templateFile = this.templateFile;
    }

    const yamlStr = jsyaml.dump(state);
    await window.electron.ipcRenderer.exportYAML(filePath, yamlStr);
  }
}

export default StateManager;
