import { v4 as uuidv4 } from 'uuid';
import jsyaml from 'js-yaml';

class Card {
  readonly id: string;

  file: string | null;

  useSidebar: boolean;

  blankSlide: boolean;

  private listeners: (() => void)[] = [];

  constructor(
    file: string | null = null,
    useSidebar: boolean = true,
    blankSlide: boolean = true,
  ) {
    this.id = uuidv4();
    this.file = file;
    this.useSidebar = useSidebar;
    this.blankSlide = blankSlide;
  }

  addListener(listener: () => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: () => void): void {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }

  setBlankSlide(blankSlide: boolean): void {
    this.blankSlide = blankSlide;
    this.notifyListeners();
  }

  setUseSidebar(useSidebar: boolean): void {
    this.useSidebar = useSidebar;
    this.notifyListeners();
  }

  setFile(file: string | null): void {
    this.file = file;
    this.notifyListeners();
  }

  getBlankSlide(): boolean {
    return this.blankSlide;
  }

  getUseSidebar(): boolean {
    return this.useSidebar;
  }

  getFile(): string | null {
    return this.file;
  }

  getID(): string {
    return this.id;
  }
}

export const cardYAMLType = new jsyaml.Type('!Card', {
  kind: 'mapping',
  instanceOf: Card,
  construct: (data) =>
    Object.assign(new Card(), {
      file: data.file,
      useSidebar: data.useSidebar,
      blankSlide: data.blankSlide,
    }),
  represent: (card: any) => ({
    file: card.file,
    useSidebar: card.useSidebar,
    blankSlide: card.blankSlide,
  }),
});

export default Card;

// const getTitleOrBasename = (part: any, filename: string | null): string => {
//   if (typeof filename !== 'string') {
//     return part.title;
//   }

//   const parts = filename.split(/[\\/]/);
//   const basename = parts[parts.length - 1];
//   const name = basename.split('.').slice(0, -1).join('.');

//   return !part.title || part.title.trim() === '' ? name : part.title;
// };
