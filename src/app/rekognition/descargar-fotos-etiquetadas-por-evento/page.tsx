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
  useEffect(() => {
    if (!isAuthenticated) {
      redirect("/");
    }
  }, []);

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

  async function onSubmit() {
    setIsLoading(true);
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

      for (let presignedUrl of presignedUrls) {
        const blob = await fetchImage(presignedUrl);
        const filename = Math.random() + ".jpg";
        zip.file(filename, blob);
      }

      const generatedZipFile = await zip.generateAsync({ type: "blob" });
      saveAs(generatedZipFile, "evento_" + eventNumber);
      toast({
        title: "Fotos encontradas",
        description: "Se descargaron las fotos del evento " + eventNumber,
        status: "success",
        duration: null,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
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
      <Spinner size="xl" />
    </>
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen-80">
      {!isLoading ? downloadTSX : loadingTSX}
    </div>
  );
}
