import jsyaml from 'js-yaml';
import StateManager, { schema } from '../types/StateManager';

export function dumpStateManager(data: any): string {
  return jsyaml.dump(data, { schema });
}

export function loadStateManager(data: any): any {
  return jsyaml.load(data, { schema });
}

export function dumpTemplateFile(): string {
  return jsyaml.dump({
    templateFile: StateManager.getInstance().getTemplateFile(),
  });
}

export function loadTemplateFile(data: any): void {
  const state: any = jsyaml.dump(data);
  StateManager.getInstance().setTemplateFile(state?.templateFile);
}

export async function writeTextFile(
  filePath: string,
  data: string,
): Promise<void> {
  await window.electron.ipcRenderer.writeTextFile(filePath, data);
}
