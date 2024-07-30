import { InputNumberItem } from "./types";

/* 
    Receives an array of InputNumberItem and checks for repeated values. 
    If there are any repeated values, it returns false and sets the isValid property to false for all repeated items except the first occurrence. 
    If there are no repeated values, it returns true.
 */
export const validateInputNumberItems = (items: InputNumberItem[]): boolean => {
  const valueMap = new Map<number | undefined, number>(); // To track occurrences of each value

  // First pass: Identify and count each value's occurrences
  items.forEach((item, index) => {
    if (valueMap.has(item.value)) {
      valueMap.set(item.value, valueMap.get(item.value)! + 1);
    } else {
      valueMap.set(item.value, 1);
    }
  });

  // Second pass: Set isValid to false for repeated values (except the first occurrence)
  const seen = new Set<number | undefined>();
  items.forEach((item) => {
    if (valueMap.get(item.value)! > 1) {
      if (seen.has(item.value)) {
        item.isValid = false;
      } else {
        seen.add(item.value);
      }
    }
  });

  // Check if there are any repeated values
  const hasRepeats = Array.from(valueMap.values()).some((count) => count > 1);

  // Check for undefined values
  let hasUndefinedValues = false;
  for (let item of items) {
    if (item.value === undefined) {
      item.isValid = false;
      hasUndefinedValues = true;
    }
  }

  if (hasUndefinedValues) {
    return false;
  }
  if (hasRepeats) {
    return false;
  }
  return true;
};
