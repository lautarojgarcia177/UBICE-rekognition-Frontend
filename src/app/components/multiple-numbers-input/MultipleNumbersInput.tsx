import { Dispatch, SetStateAction } from "react";
import { Button, Text } from "@chakra-ui/react";
import { Plus, Trash } from "lucide-react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { InputNumberItem } from "@/app/types";

export default function MultipleNumbersInput({
  label,
  numbersArray,
  setNumbersArray,
}: {
  label: string;
  numbersArray: Array<InputNumberItem>;
  setNumbersArray: Dispatch<SetStateAction<InputNumberItem[]>>;
}) {
  function addNumber() {
    setNumbersArray([
      ...numbersArray,
      {
        value: 0,
        isValid: true,
      },
    ]);
  }

  function handleNumberChange(index: number, number: number) {
    let data = [...numbersArray];
    data[index] = {
      value: number,
      isValid: true,
    };
    setNumbersArray(data);
  }

  function removeNumber(index: number) {
    let data = [...numbersArray];
    data.splice(index, 1);
    setNumbersArray(data);
  }

  return (
    <>
      <div className="flex items-center">
        <Text>{label}</Text>
        <Button onClick={addNumber} className="ms-2">
          <Plus />
        </Button>
      </div>
      {numbersArray.map((n, index) => (
        <div key={index}>
          <div className="flex mt-2">
            <NumberInput
              onChange={(valueString) =>
                handleNumberChange(index, Number(valueString))
              }
              value={n.value}
              isInvalid={!numbersArray[index].isValid}
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <Button type="button" onClick={() => removeNumber(index)}>
              <Trash />
            </Button>
          </div>
          {!numbersArray[index].isValid && (
            <Text textColor={"red"}>El numero ingresado esta repetido</Text>
          )}
        </div>
      ))}
    </>
  );
}
