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

  private backupFolder: string | null = null;

  private cards: Card[] = [];

  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.initializeFromSettings();
  }

  static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private async initializeFromSettings(): Promise<void> {
    const appSettings = await window.electron.ipcRenderer.getAppSettings();
    if (appSettings && appSettings.templateFile) {
      this.templateFile = appSettings.templateFile;
    }
    if (appSettings && appSettings.backupFolder) {
      this.backupFolder = appSettings.backupFolder;
    }
  }

  private async callDirnameForSetBackupFolder(file: string): Promise<void> {
    const result = await window.electron.ipcRenderer.pathParse(file);
    const backupFolder = result.status === 'success' ? result.value : null;

    if (backupFolder !== null) {
      this.setBackupFolder(backupFolder.dir);
    }
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

    // Update app settings
    (async () => {
      try {
        const response = await window.electron.ipcRenderer.setAppSettings({
          templateFile: file,
        });
        if (response.status !== 'success') {
          console.error('Failed to update app settings:', response.message);
        }
      } catch (error) {
        console.error('Error invoking set-app-settings:', error);
      }
    })();
  }

  getBackupFolder(): string | null {
    return this.backupFolder;
  }

  setBackupFolder(folder: string): void {
    this.backupFolder = folder;
    this.notifyListeners();

    // Update app settings
    (async () => {
      try {
        const response = await window.electron.ipcRenderer.setAppSettings({
          backupFolder: folder,
        });
        if (response.status !== 'success') {
          console.error('Failed to update app settings:', response.message);
        }
      } catch (error) {
        console.error('Error invoking set-app-settings:', error);
      }
    })();
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

    if (this.backupFolder === null) {
      // if backup folder is not set, set it to the folder of the output file
      // for some unknowable reason, the designers of electron decided that even accessing path was a security risk
      // this calls notifyListeners() internally, so we don't need to call it again
      this.callDirnameForSetBackupFolder(file);
    } else {
      // otherwise, notify listeners
      this.notifyListeners();
    }
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

  findCard(id: string): number {
    return this.cards.findIndex((card) => card.id === id);
  }

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
    cards: state.getCards().filter((card: Card) => card.getFile() !== null),
  }),
});

const schema = jsyaml.DEFAULT_SCHEMA.extend([
  cardYAMLType,
  StateManagerYAMLType,
]);

export default StateManager;
export { schema };
