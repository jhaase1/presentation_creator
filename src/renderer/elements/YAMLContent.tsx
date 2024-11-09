import React, { useEffect, useState } from 'react';
import CardList from './CardList';

export interface YAMLData {
  side_bar_file?: any;
  parts_list?: any[];
}

const cardListInstance = new CardList();

const YAMLContent: React.FC<{ yamlData: YAMLData | null }> = ({ yamlData }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    // Update the file selector when yamlData.side_bar_file changes
    if (yamlData?.side_bar_file) {
      const blob = new Blob([JSON.stringify(yamlData.side_bar_file, null, 2)], {
        type: 'application/json',
      });
      const file = new File([blob], 'side_bar_file.yaml', {
        type: 'application/x-yaml',
      });
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }

    // Initialize parts based on parts_list
    if (yamlData?.parts_list) {
      yamlData.parts_list.forEach((obj: any) => {
        cardListInstance.addCard(obj);
      });
    }
  }, [yamlData?.side_bar_file, yamlData?.parts_list]);

  const containerStyle: React.CSSProperties = {
    maxWidth: '400px',
    overflowX: 'auto',
    margin: '0 auto', // Center the content
  };

  return (
    <div style={containerStyle}>
      {yamlData?.side_bar_file && (
        <div>
          <h2>Optional "side_bar_file":</h2>
          <pre>{JSON.stringify(yamlData.side_bar_file, null, 2)}</pre>
        </div>
      )}

      {yamlData && (
        <div>
          <h2>Parsed YAML Data:</h2>
          <pre>{JSON.stringify(yamlData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default YAMLContent;
