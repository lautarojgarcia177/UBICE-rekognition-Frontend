"use client";

import {
  MultiImageDropzone,
  type FileState,
} from "@/app/components/MultiImageDropzone/MultiImageDropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  Input,
} from "@chakra-ui/react";
import MultipleFilesInput from "../components/multiple-files-input/MultipleFilesInput";
import FilesUpload from "../components/files-upload/FilesUpload";

export default function MultiImageDropzoneUsage() {
  const [fileStates, setFileStates] = useState<FileState[]>([]);
  const [eventNumber, setEventNumber] = useState<number>();
  const { edgestore } = useEdgeStore();

  async function onUploadPhotos(selectedFiles: File[]) {
    console.log(selectedFiles);
    // if (!eventNumber) {
    //   setInvalidTextNumber(true);
    //   return;
    // }
    // setAmountOfPhotosToUpload(selectedFiles.length);
    // setIsUploading(true);
    // suscribirseANotificaciones();
  }

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
    <div className="flex flex-col justify-center items-center">
      <div className="w-64">
        <Text>Numero de evento</Text>
        <NumberInput
          onChange={(newNumber) => setEventNumber(Number(newNumber))}
          value={eventNumber}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </div>
      <FilesUpload
        onUploadPhotos={onUploadPhotos}
        disableSubmit={!eventNumber}
      />
    </div>
  );
}
