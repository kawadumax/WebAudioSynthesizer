import Label from "@parts/Label";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import styles from "@styles/TremoloToggle.module.scss";

const TremoloToggle = () => {
  return (
    <div className={styles.TremoloToggle}>
      <Label>Tremolo</Label>

      <Led className="fx-toggle-led" isActive={true}></Led>
      <Toggle></Toggle>
    </div>
  );
};

export default TremoloToggle;
