import jsyaml from 'js-yaml';

function readYAMLFile(file: File): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        const yamlContent = event.target?.result as string;
        const data = jsyaml.load(yamlContent);
        resolve(data);
      };

      reader.readAsText(file);
    } catch (error: any) {
      reject(new Error(`Error reading file: ${error.message}`));
    }
  });
}

export default readYAMLFile;
