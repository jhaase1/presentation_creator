import jsyaml from 'js-yaml';
import CardList from './CardList';

class StateManager {
  cardList: CardList;

  private static instance: StateManager;

  private templateFile: string | null = null;

  private sidebarFile: string | null = null;

  private outputFile: string | null = null;

  private listeners: Set<() => void> = new Set();

  private cardListInstance: CardList | null = null;

  private constructor() {
    this.cardList = new CardList();
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

  getcardList(): CardList | null {
    return this.cardList;
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
      state.cardList = this.cardListInstance;
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
