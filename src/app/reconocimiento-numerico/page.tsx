"use client";

import { useEdgeStore } from "@/lib/edgestore";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Text,
  CircularProgress,
} from "@chakra-ui/react";
import FilesUpload from "../components/files-upload/FilesUpload";
import { useToast } from "@chakra-ui/react";

export default function ReconocimientoNumerico() {
  const [eventNumber, setEventNumber] = useState<number>();
  const [uploadedPhotosProgress, setUploadedPhotosProgress] = useState(0);
  const { edgestore } = useEdgeStore();
  const [isUploading, setIsUploading] = useState(false);

  const toast = useToast();

  useEffect(() => {
    if (uploadedPhotosProgress === 100) {
      setIsUploading(false);
      setUploadedPhotosProgress(0);
      toast({
        title: "Fotos subidas",
        description: "Se subieron las fotos del evento " + eventNumber,
        status: "success",
        duration: null,
        isClosable: true,
      });
    }
  }, [uploadedPhotosProgress, eventNumber, toast]);

  async function onUploadPhotos(selectedFiles: File[]) {
    let amountOfPhotosUploaded = 0;
    const promises = selectedFiles.map((file) =>
      edgestore.publicImages.upload({
        file: file,
        options: {
          manualFileName: generateFileName(),
          temporary: true,
        },
        onProgressChange: async (progress) => {
          if (progress === 100) {
            amountOfPhotosUploaded++;
            const progress =
              (amountOfPhotosUploaded / selectedFiles.length) * 100;
            setUploadedPhotosProgress(progress);
          }
        },
      })
    );
    setIsUploading(true);
    try {
      await Promise.all(promises);
    } catch (error) {
      console.error("Hubo un error subiendo las fotos"),
        toast({
          title: "Error subiendo las fotos",
          description:
            "Las fotos no se han podido subir, revise la consola del navegador",
          status: "error",
          duration: null,
          isClosable: true,
        });
    }
  }

  function generateFileName() {
    const newUuid = uuidv4();
    return `evento_${eventNumber}/foto_${newUuid}`;
  }

  function formaUploadedPhotosProgress() {
    // Check if the number is an integer
    if (Number.isInteger(uploadedPhotosProgress)) {
      return uploadedPhotosProgress.toString();
    }
    // If it's a floating number, format it to two decimal places
    return uploadedPhotosProgress.toFixed(2).replace(/\.00$/, "");
  }

  const uploadTSX = (
    <>
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
    </>
  );

  const uploadingTSX = (
    <>
      <Text>Subiendo las fotos...</Text>
      <CircularProgress
        capIsRound
        value={uploadedPhotosProgress}
        size="120px"
      />
      <Text>{formaUploadedPhotosProgress()}%</Text>
    </>
  );

  return (
    <div className="flex flex-col justify-center items-center">
      {!isUploading ? uploadTSX : uploadingTSX}
    </div>
  );
}
