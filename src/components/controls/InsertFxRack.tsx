import Display from "@parts/Display";
import Knob from "@parts/Knob";
import Label from "@parts/Label";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import type { EffectParamKey, EffectSlot, EffectType } from "@/modules/AudioEngine/effects";
import { createEffectSlot } from "@/modules/AudioEngine/effects";
import { useEffect, useMemo, useState } from "react";
import styles from "@styles/controls/InsertFxRack.module.scss";

type ParamDefinition = {
  key: EffectParamKey;
  label: string;
  min: number;
  max: number;
};

const EFFECT_OPTIONS: Array<{ value: EffectType; label: string }> = [
  { value: "none", label: "None" },
  { value: "distortion", label: "Distortion" },
  { value: "delay", label: "Delay" },
  { value: "reverb", label: "Reverb" },
  { value: "tremolo", label: "Tremolo" },
];

const PARAMS_BY_TYPE: Record<EffectType, ParamDefinition[]> = {
  none: [],
  distortion: [
    { key: "drive", label: "Drive", min: 0, max: 1 },
    { key: "tone", label: "Tone", min: 0, max: 1 },
    { key: "mix", label: "Mix", min: 0, max: 1 },
  ],
  delay: [
    { key: "time", label: "Time", min: 0, max: 1 },
    { key: "feedback", label: "Feedback", min: 0, max: 0.95 },
    { key: "mix", label: "Mix", min: 0, max: 1 },
  ],
  reverb: [
    { key: "room", label: "Room", min: 0, max: 1 },
    { key: "damping", label: "Damping", min: 0, max: 1 },
    { key: "mix", label: "Mix", min: 0, max: 1 },
  ],
  tremolo: [
    { key: "rate", label: "Rate", min: 0, max: 20 },
    { key: "depth", label: "Depth", min: 0, max: 1 },
    { key: "mix", label: "Mix", min: 0, max: 1 },
  ],
};

const PARAM_KEYS_BY_TYPE = {
  none: [] as const,
  distortion: ["drive", "tone", "mix"] as const,
  delay: ["time", "feedback", "mix"] as const,
  reverb: ["room", "damping", "mix"] as const,
  tremolo: ["rate", "depth", "mix"] as const,
};

type ParamKeyByType = {
  [K in EffectType]: (typeof PARAM_KEYS_BY_TYPE)[K][number];
};

const isParamKeyForType = <T extends EffectType>(
  type: T,
  key: EffectParamKey,
): key is ParamKeyByType[T] => {
  return (PARAM_KEYS_BY_TYPE[type] as readonly string[]).includes(key);
};

const createInitialSlots = (): EffectSlot[] => [
  createEffectSlot("fx-1", "tremolo"),
  createEffectSlot("fx-2", "none"),
  createEffectSlot("fx-3", "none"),
  createEffectSlot("fx-4", "none"),
];

const InsertFxRack = () => {
  const { engine, isReady } = useAudioEngine();
  const [slots, setSlots] = useState<EffectSlot[]>(() => createInitialSlots());

  useEffect(() => {
    if (!isReady) return;
    engine.setInsertChain(slots);
  }, [engine, isReady, slots]);

  const handleTypeChange = (id: string, type: EffectType) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;
        const next = createEffectSlot(id, type);
        const collapsed = type === "none" ? true : slot.collapsed;
        return { ...next, collapsed };
      }),
    );
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, enabled } : slot)),
    );
  };

  const handleParamChange = (id: string, key: EffectParamKey, value: number) => {
    setSlots((prev) =>
      prev.map((slot) =>
        slot.id === id
          ? (() => {
              if (slot.type === "none") return slot;
              if (!isParamKeyForType(slot.type, key)) return slot;
              const params = {
                ...slot.params,
                [key]: value,
              } as typeof slot.params;
              return { ...slot, params };
            })()
          : slot,
      ),
    );
  };

  const handleCollapse = (id: string) => {
    setSlots((prev) =>
      prev.map((slot) => (slot.id === id ? { ...slot, collapsed: !slot.collapsed } : slot)),
    );
  };

  const handleClear = (id: string) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? createEffectSlot(id, "none") : slot)));
  };

  const handleMove = (id: string, direction: "up" | "down") => {
    setSlots((prev) => {
      const index = prev.findIndex((slot) => slot.id === id);
      if (index === -1) return prev;
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const next = [...prev];
      const [slot] = next.splice(index, 1);
      next.splice(nextIndex, 0, slot);
      return next;
    });
  };

  const slotsWithIndex = useMemo(
    () => slots.map((slot, index) => ({ slot, index })),
    [slots],
  );

  return (
    <section className={styles.InsertFxRack}>
      <div className={styles.header}>
        <Label className={styles.title}>Insert FX</Label>
        <span className={styles.subtitle}>Slots: {slots.length}</span>
      </div>
      <div className={styles.slots}>
        {slotsWithIndex.map(({ slot, index }) => (
          <div key={slot.id} className={styles.slot} data-type={slot.type}>
            <div className={styles.slotHeader}>
              <div className={styles.slotLeft}>
                <Label className={styles.slotLabel}>Slot {index + 1}</Label>
                <select
                  className={styles.select}
                  value={slot.type}
                  onChange={(event) => handleTypeChange(slot.id, event.target.value as EffectType)}
                >
                  {EFFECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.slotRight}>
                <div className={styles.enable}>
                  <Led className={styles.led} isActive={slot.enabled && slot.type !== "none"}></Led>
                  {slot.type === "none" ? (
                    <span className={styles.empty}>Empty</span>
                  ) : (
                    <Toggle isOn={slot.enabled} onToggle={(next) => handleToggle(slot.id, next)} />
                  )}
                </div>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => handleMove(slot.id, "up")}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => handleMove(slot.id, "down")}
                    disabled={index === slots.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => handleCollapse(slot.id)}
                    disabled={slot.type === "none"}
                  >
                    {slot.collapsed ? "Show" : "Hide"}
                  </button>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => handleClear(slot.id)}
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
            {slot.type !== "none" && !slot.collapsed && (
              <div className={styles.params}>
                {PARAMS_BY_TYPE[slot.type].map((param) => {
                  const params = slot.params as Partial<Record<EffectParamKey, number>>;
                  const value = params[param.key] ?? 0;
                  return (
                  <div key={`${slot.id}-${slot.type}-${param.key}`} className={styles.param}>
                    <Label>{param.label}</Label>
                    <Knob
                      onChange={(value) => handleParamChange(slot.id, param.key, value)}
                      defaultValue={value}
                      minValue={param.min}
                      maxValue={param.max}
                    />
                    <Display parameter={value}></Display>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InsertFxRack;
