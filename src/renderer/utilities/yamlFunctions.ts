import jsyaml from 'js-yaml';
// import StateManager from '../types/StateManager';
import { schema } from '../types/yamlTypes';

export function dumpYAML(data: any): string {
  return jsyaml.dump(data, { schema });
}

export function loadYAML(data: string): any {
  return jsyaml.load(data, { schema });
}

// export function dumpTemplateFile(): string {
//   return jsyaml.dump({
//     templateFile: StateManager.getInstance().getTemplateFile(),
//   });
// }

// export function loadTemplateFile(data: string): void {
//   const state: any = loadYAML(data);
//   StateManager.getInstance().setTemplateFile(state?.templateFile);
// }

export async function exportTextFile(
  filePath: string,
  data: string,
): Promise<void> {
  await window.electron.ipcRenderer.exportTextFile(filePath, data);
}
