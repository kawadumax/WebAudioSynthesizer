import "@styles/Display.scss";

interface Props {
  parameter: number | string;
  className?: string;
}

const Display = ({ parameter, className }: Props) => {
  let displayValue: string = "";
  const parameterType: string = typeof parameter;

  switch (typeof parameter) {
    case "string":
      displayValue = parameter;
      break;
    case "number":
      displayValue = parameter.toFixed(2);
      break;
    default:
      break;
  }

  return <p className={`parameter-display ${parameterType} ${className ?? ""}`}>{displayValue}</p>;
};

export default Display;
