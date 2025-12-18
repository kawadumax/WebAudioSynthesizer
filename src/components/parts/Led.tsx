import "@styles/Led.scss";

interface Props {
  className?: string;
  isActive: boolean;
}

const Led = ({ className, isActive }: Props) => {
  return <i className={`${className} ${isActive ? "led on" : "led off"}`}></i>;
};

export default Led;
