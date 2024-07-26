import { useState } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";
import { Trash } from "lucide-react";
import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

export default function MultipleNumbersInput() {
  const [numbers, setNumbers] = useState<Array<number | null>>([]);

  function addNumber() {
    setNumbers([...numbers, null]);
  }

  function handleNumberChange(index: number, number: number) {
    let data = [...numbers];
    data[index] = number;
    setNumbers(data);
  }

  function removeNumber(index: number) {
    let data = [...numbers];
    data.splice(index, 1);
    setNumbers(data);
  }

  return numbers.map((n, index) => (
    <div key={index}>
      <NumberInput
        onChange={(valueString) =>
          handleNumberChange(index, Number(valueString))
        }
        value={Number(n)}
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
  ));
}
