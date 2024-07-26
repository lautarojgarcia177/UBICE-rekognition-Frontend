"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heading } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import PasswordInput from "./components/password-input/PasswordInput";
import { Spinner } from "@chakra-ui/react";
import { Text } from "@chakra-ui/react";

export default function Entrance() {
  const [pass, setPass] = useState<string>("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [invalidPass, setInvalidPass] = useState(false);

  async function handleLogin() {
    const formData = new FormData();
    formData.append("pass", pass);
    setPass("");
    setLoading(true);
    const response = await fetch("/api/login", {
      method: "POST",
      body: formData,
    });
    setLoading(false);
    if (response.ok) {
      router.push("/rekognition/reconocimiento-numerico");
    } else {
      setInvalidPass(true);
    }
  }

  function onPasswordInput(newValue: string) {
    setInvalidPass(false);
    setPass(newValue);
  }

  const loadingJSX = (
    <div className="h-screen flex justify-center items-center">
      <Spinner size="xl" label="Cargando" />;
    </div>
  );

  const formJSX = (
    <main className="flex flex-col items-center h-screen">
      <Heading className="mt-20">
        Bienvenido a UBICE Reconocimiento de fotos
      </Heading>
      <div className="mt-12">
        <Text className="mt-2">Porfavor Ingrese la clave para entrar:</Text>
        <div className="w-96">
          <PasswordInput
            value={pass}
            setValue={onPasswordInput}
            isInvalid={invalidPass}
            onSubmit={handleLogin}
          />
        </div>
        <Button
          className="mt-4 w-96"
          colorScheme="blue"
          isDisabled={!pass}
          onClick={handleLogin}
        >
          Ingresar
        </Button>
      </div>
    </main>
  );

  if (loading) {
    return loadingJSX;
  }
  return formJSX;
}
