import React, { useState, ChangeEvent } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";

const MultipleFilesInput: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);

  // Handler for file input change
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(Array.from(event.target.files));
    }
  };

  return (
    <div>
      <Button>
        <input type="file" multiple onChange={handleFileChange} />
      </Button>
      <div>
        {files.length > 0 && (
          <div>
            <h3>Fotos seleccionadas</h3>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultipleFilesInput;
