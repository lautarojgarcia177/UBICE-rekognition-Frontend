import {
  Button,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from "@chakra-ui/react";
import React from "react";

export default function PasswordInput({
  value,
  setValue,
  isInvalid,
  onSubmit,
}: {
  value: string;
  setValue: (value: string) => void;
  isInvalid: boolean;
  onSubmit: () => void;
}) {
  const [show, setShow] = React.useState(false);
  const handleClick = () => setShow(!show);

  function handleKeyDown(event: any) {
    if (event.code === "Enter") {
      onSubmit();
    }
  }

  return (
    <>
      <InputGroup size="md">
        <Input
          pr="4.5rem"
          type={show ? "text" : "password"}
          placeholder="Ingresa la clave para entrar"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          isInvalid={isInvalid}
          onKeyDown={handleKeyDown}
        />
        <InputRightElement width="4.5rem" className="me-1">
          <Button h="1.75rem" size="sm" onClick={handleClick}>
            {show ? "Ocultar" : "Mostrar"}
          </Button>
        </InputRightElement>
      </InputGroup>
      {isInvalid && (
        <Text textColor={"red"}>La clave ingresada no es correcta</Text>
      )}
    </>
  );
}
