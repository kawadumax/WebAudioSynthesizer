import "@styles/Display.scss";
import { stringify } from "querystring";

interface Props {
  parameter: number | string;
}

const Display = ({ parameter }: Props) => {
  let displayValue: string = "";
  let parameterType: string = typeof parameter;

  switch (typeof parameter) {
    case 'string':
      displayValue = parameter;
      break;
    case 'number':
      displayValue = parameter.toFixed(2);
      break;
    default:
      break;
  }


  return <p className={"parameter-display " + parameterType}>{displayValue}</p>;
};

export default Display;
