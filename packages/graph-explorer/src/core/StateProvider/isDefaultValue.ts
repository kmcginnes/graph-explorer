import { RESET } from "jotai/utils";

const isDefaultValue = (value: any): value is typeof RESET => {
  return value === RESET;
};

export default isDefaultValue;
