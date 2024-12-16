export class TemplateFileManager {
  private static instance: TemplateFileManager;
  private templateFile: string | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): TemplateFileManager {
    if (!TemplateFileManager.instance) {
      TemplateFileManager.instance = new TemplateFileManager();
    }
    return TemplateFileManager.instance;
  }

  getTemplateFile(): string | null {
    return this.templateFile;
  }

  setTemplateFile(file: string): void {
    this.templateFile = file;
    console.log("setting template file", this.templateFile)
    this.notifyListeners();
  }

  onFileChange(listener: () => void): void {
    this.listeners.add(listener);
  }

  offFileChange(listener: () => void): void {
    this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    console.log("notifying listeners", this.listeners)
    this.listeners.forEach((listener) => listener());
  }
}
