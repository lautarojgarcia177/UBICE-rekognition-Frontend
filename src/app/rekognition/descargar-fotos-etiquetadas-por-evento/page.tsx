"use client";

import {
  Text,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  CircularProgress,
  Button,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useToast } from "@chakra-ui/react";
import { isAuthenticated } from "@/app/authStatus";
import { redirect } from "next/navigation";

export default function DescargarFotosEtiquetadasPorEvento() {
  const [eventNumber, setEventNumber] = useState<number>();
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

  async function onSubmit() {
    const formValid = checkValidity();
    if (formValid) {
      // Buscar fotos y descargarlas
      const response = await fetch(`/api/download-labeled-photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventNumber }),
      });
      if (!response.ok) {
        const responseError = await response.json();
        if (responseError) {
          throw new Error(responseError.error);
        }
        throw new Error("An error occurred while downloading the zip file");
      } else {
        setIsLoading(false);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `evento_${eventNumber}.zip`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({
          title: "Fotos encontradas",
          description: "Se descargaron las fotos del evento " + eventNumber,
          status: "success",
          duration: null,
          isClosable: true,
        });
      }
    }
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
      <CircularProgress capIsRound size="120px" />
    </>
  );

  return (
    <div className="flex flex-col justify-center items-center h-screen-80">
      {!isLoading ? downloadTSX : loadingTSX}
    </div>
  );
}
