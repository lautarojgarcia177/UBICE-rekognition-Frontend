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
import { useState } from "react";

export default function DescargarFotosEtiquetadasPorEvento() {
  const [eventNumber, setEventNumber] = useState<number>();
  const [invalidEventNumber, setInvalidEventNumber] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

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
      <Button className="mt-4" onClick={onSubmit}>Descargar fotos</Button>
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
