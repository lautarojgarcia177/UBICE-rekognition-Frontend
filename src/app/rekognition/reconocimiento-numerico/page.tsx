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
import { useToast } from "@chakra-ui/react";
import FilesUpload from "@/app/components/files-upload/FilesUpload";
import MultipleNumbersInput from "@/app/components/multiple-numbers-input/MultipleNumbersInput";
import { InputNumberItem } from "@/app/types";
import { validateInputNumberItems } from "@/app/utils";
import { useForceUpdate } from "@/app/hooks";

export default function ReconocimientoNumerico() {
  const [eventNumber, setEventNumber] = useState<number>();
  const [invalidEventNumber, setInvalidEventNumber] = useState<boolean>(false);
  const [bannedNumbers, setBannedNumbers] = useState<InputNumberItem[]>([]);
  const [uploadedPhotosProgress, setUploadedPhotosProgress] = useState(0);
  const { edgestore } = useEdgeStore();
  const [isUploading, setIsUploading] = useState(false);
  const forceUpdate = useForceUpdate();

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
      setBannedNumbers([]);
      setEventNumber(0);
    }
  }, [uploadedPhotosProgress, eventNumber, toast]);

  function checkValidity() {
    const bannedNumbersValid = validateInputNumberItems(bannedNumbers);
    if (!eventNumber) {
      setInvalidEventNumber(true);
    }
    forceUpdate();
    return bannedNumbersValid && eventNumber;
  }

  async function onSubmit(selectedFiles: File[]) {
    const formValid = checkValidity();
    if (formValid) {
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
  }

  function generateFileName() {
    let bannedNumbersString = "bannedNumbers-";
    for (let bannedNumber of bannedNumbers) {
      bannedNumbersString += String(bannedNumber.value) + "_";
    }
    const newUuid = uuidv4();
    return `${bannedNumbersString}/evento_${eventNumber}/foto_${newUuid}`;
  }

  function formaUploadedPhotosProgress() {
    // Check if the number is an integer
    if (Number.isInteger(uploadedPhotosProgress)) {
      return uploadedPhotosProgress.toString();
    }
    // If it's a floating number, format it to two decimal places
    return uploadedPhotosProgress.toFixed(2).replace(/\.00$/, "");
  }

  function handleEventNumberInputChange(newNumber: any) {
    setInvalidEventNumber(false);
    setEventNumber(Number(newNumber));
  }

  const uploadTSX = (
    <>
      <div className="w-80">
        <Text>Número de evento</Text>
        <NumberInput
          onChange={handleEventNumberInputChange}
          value={eventNumber}
          min={0}
          isInvalid={invalidEventNumber}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        {invalidEventNumber && (
          <Text textColor={"red"}>Debe ingresar un número de evento</Text>
        )}
      </div>
      <div className="w-80 mt-4 mb-4">
        <MultipleNumbersInput
          label="Números a ignorar"
          numbersArray={bannedNumbers}
          setNumbersArray={setBannedNumbers}
        />
      </div>
      <FilesUpload submit={onSubmit} />
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
    <div className="flex flex-col justify-center items-center h-screen-80">
      {!isUploading ? uploadTSX : uploadingTSX}
    </div>
  );
}
