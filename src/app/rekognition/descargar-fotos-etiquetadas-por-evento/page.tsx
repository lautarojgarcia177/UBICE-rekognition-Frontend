"use client";

import {
  Text,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { isAuthenticated } from "@/app/authStatus";
import { redirect } from "next/navigation";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function DescargarFotosEtiquetadasPorEvento() {
  const [eventNumber, setEventNumber] = useState<number | undefined>();
  const [invalidEventNumber, setInvalidEventNumber] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadedPhotosProgress, setDownloadedPhotosProgress] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/");
    }
  }, []);

  useEffect(() => {
    if (downloadedPhotosProgress === 100) {
      setIsLoading(false);
      setDownloadedPhotosProgress(0);
      setEventNumber(undefined);
    }
  }, [downloadedPhotosProgress, eventNumber]);

  const toast = useToast();

  function handleEventNumberInputChange(newNumber: any) {
    setInvalidEventNumber(false);
    setEventNumber(Number(newNumber));
  }

  function checkValidity() {
    if (!eventNumber) {
      setInvalidEventNumber(true);
    }
    return Boolean(eventNumber);
  }

  async function fetchImage(url: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image at ${url}`);
    return response.blob();
  }

  function formatDownloadedPhotosProgress() {
    // Check if the number is an integer
    if (Number.isInteger(downloadedPhotosProgress)) {
      return downloadedPhotosProgress.toString();
    }
    // If it's a floating number, format it to two decimal places
    return downloadedPhotosProgress.toFixed(2).replace(/\.00$/, "");
  }

  async function onSubmit() {
    setIsLoading(true);
    const valid = checkValidity();
    if (valid) {
      try {
        const response = await fetch(`/api/get-presigned-multiple-urls`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ eventNumber }),
        });
        const { presignedUrls } = await response.json();

        const zip = new JSZip();

        const amountOfPresignedUrls = presignedUrls.length;
        const advanceStep = 100 / amountOfPresignedUrls;

        for (let presignedUrl of presignedUrls) {
          const blob = await fetchImage(presignedUrl);
          const filename = Math.random() + ".jpg";
          zip.file(filename, blob);
          setDownloadedPhotosProgress(
            (previousProgress) => previousProgress + advanceStep
          );
        }
        setDownloadedPhotosProgress(0);

        const generatedZipFile = await zip.generateAsync({ type: "blob" });
        saveAs(generatedZipFile, "evento_" + eventNumber);
        toast({
          title: "Fotos encontradas",
          description: "Se descargaron las fotos del evento " + eventNumber,
          status: "success",
          duration: null,
          isClosable: true,
        });
        setEventNumber(undefined);
      } catch (error) {
        console.error(error);
        setDownloadedPhotosProgress(0);
      }
    }
    setIsLoading(false);
  }

  const downloadTSX = (
    <>
      <div className="w-96">
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
          <Text textColor={"red"}>
            No se encontraron fotos para el número de evento ingresado
          </Text>
        )}
      </div>
      <Button className="mt-4" onClick={onSubmit}>
        Descargar fotos
      </Button>
    </>
  );

  const loadingTSX = (
    <>
      {downloadedPhotosProgress > 0 && <Text>Descargando las fotos...</Text>}
      <Spinner size="xl" />
      {downloadedPhotosProgress > 0 && (
        <Text>{formatDownloadedPhotosProgress()}%</Text>
      )}
    </>
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen-80">
      {!isLoading ? downloadTSX : loadingTSX}
    </div>
  );
}
