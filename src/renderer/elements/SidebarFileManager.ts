export class SidebarFileManager {
  private static instance: SidebarFileManager;
  private sidebarFile: string | null = null;
  private listeners: Set<() => void> = new Set();

  private constructor() {}

  static getInstance(): SidebarFileManager {
    if (!SidebarFileManager.instance) {
      SidebarFileManager.instance = new SidebarFileManager();
    }
    return SidebarFileManager.instance;
  }

  getSidebarFile(): string | null {
    return this.sidebarFile;
  }

  setSidebarFile(file: string): void {
    this.sidebarFile = file;
    console.log("setting sidebar file", this.sidebarFile)
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
