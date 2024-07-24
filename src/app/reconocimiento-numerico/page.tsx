"use client";

import {
  MultiImageDropzone,
  type FileState,
} from "@/app/components/MultiImageDropzone/MultiImageDropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function MultiImageDropzoneUsage() {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const { edgestore } = useEdgeStore();

  function updateFileProgress(key: string, progress: FileState["progress"]) {
    setFileStates((fileStates) => {
      const newFileStates = structuredClone(fileStates);
      const fileState = newFileStates.find(
        (fileState) => fileState.key === key
      );
      if (fileState) {
        fileState.progress = progress;
      }
      return newFileStates;
    });
  }

  function generateFileName() {
    const newUuid = uuidv4();
    const eventNumber = 11;
    return `evento_11/foto_${newUuid}`;
  }

  return (
    <div>
      <MultiImageDropzone
        value={fileStates}
        dropzoneOptions={{
          multiple: true,
          maxFiles: 1000,
        }}
        onChange={(files) => {
          setFileStates(files);
        }}
        onFilesAdded={async (addedFiles) => {
          setFileStates([...fileStates, ...addedFiles]);
          await Promise.all(
            addedFiles.map(async (addedFileState) => {
              try {
                const res = await edgestore.publicImages.upload({
                  file: addedFileState.file,
                  options: {
                    temporary: true,
                    manualFileName: generateFileName(),
                  },
                  onProgressChange: async (progress) => {
                    updateFileProgress(addedFileState.key, progress);
                    if (progress === 100) {
                      // wait 1 second to set it to complete
                      // so that the user can see the progress bar at 100%
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                      updateFileProgress(addedFileState.key, "COMPLETE");
                    }
                  },
                });
                console.log(res);
              } catch (err) {
                updateFileProgress(addedFileState.key, "ERROR");
              }
            })
          );
        }}
      />
    </div>
  );
}
