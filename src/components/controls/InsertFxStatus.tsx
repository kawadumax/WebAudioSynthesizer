import Label from "@parts/Label";
import Led from "@parts/Led";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import styles from "@styles/controls/InsertFxStatus.module.scss";

const InsertFxStatus = () => {
  const { fxError, fxStatus } = useAudioEngine();
  const isReady = fxStatus === "ready";
  const statusText =
    fxStatus === "loading"
      ? "Loading"
      : fxStatus === "ready"
        ? "Ready"
        : fxStatus === "error"
          ? "Error"
          : "Idle";

  return (
    <div className={styles.InsertFxStatus} data-status={fxStatus} title={fxError ?? undefined}>
      <Label>FX</Label>
      <Led className={styles.led} isActive={isReady}></Led>
      <span className={styles.status}>{statusText}</span>
    </div>
  );
};

export default InsertFxStatus;
