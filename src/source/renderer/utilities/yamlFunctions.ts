import jsyaml from 'js-yaml';
import StateManager, { schema } from '../types/StateManager';

export function dump(data: any): string {
  return jsyaml.dump(data, { schema });
}

export function load(data: any): any {
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

export async function readTextFile(filePath: string): Promise<string> {
  return window.electron.ipcRenderer.readTextFile(filePath);
}

export async function readYAMLFile(filePath: string): Promise<any> {
  const data = await readTextFile(filePath);
  return load(data);
}
