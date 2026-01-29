import { useAudioEngine } from "@circuits/AudioCircuit/AudioEngineProvider";
import Display from "@parts/Display";
import Knob from "@parts/Knob";
import Label from "@parts/Label";
import Led from "@parts/Led";
import Toggle from "@parts/Toggle";
import styles from "@styles/controls/InsertFxRack.module.scss";
import { useEffect, useMemo, useState } from "react";
import type { EffectParamKey, EffectSlot, EffectType } from "@/modules/AudioEngine/effects";
import { createEffectSlot } from "@/modules/AudioEngine/effects";
import InsertFxStatus from "./InsertFxStatus";

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
  const [selectedSlotId, setSelectedSlotId] = useState<string>(slots[0].id);

  useEffect(() => {
    if (!isReady) return;
    engine.setInsertChain(slots);
  }, [engine, isReady, slots]);

  const handleTypeChange = (id: string, type: EffectType) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot.id !== id) return slot;
        const next = createEffectSlot(id, type);
        return { ...next, collapsed: slot.collapsed };
      }),
    );
  };

  const handleToggle = (id: string, enabled: boolean) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? { ...slot, enabled } : slot)));
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

  const handleClear = (id: string) => {
    setSlots((prev) => prev.map((slot) => (slot.id === id ? createEffectSlot(id, "none") : slot)));
  };

  const handleMove = (id: string, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent selection
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

  const slotsWithIndex = useMemo(() => slots.map((slot, index) => ({ slot, index })), [slots]);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  return (
    <section className={styles.InsertFxRack}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Label className={styles.title}>Insert FX</Label>
          <span className={styles.subtitle}>Slots: {slots.length}</span>
        </div>
        <InsertFxStatus />
      </div>

      <div className={styles.container}>
        {/* Left Pane: Slot List */}
        <div className={styles.slotList}>
          {slotsWithIndex.map(({ slot, index }) => (
            <div
              key={slot.id}
              className={`${styles.slotItem} ${selectedSlotId === slot.id ? styles.selected : ""}`}
              onClick={() => setSelectedSlotId(slot.id)}
            >
              <div className={styles.slotHeaderTop}>
                <div className={styles.slotHeaderLeft}>
                  <div className={styles.enable} onClick={(e) => e.stopPropagation()}>
                    <Led
                      className={styles.led}
                      isActive={slot.enabled && slot.type !== "none"}
                      style={{ width: 10, height: 10 }}
                    />
                    {/* Toggle always visible, disabled if none */}
                    <Toggle
                      isOn={slot.type !== "none" && slot.enabled}
                      onToggle={(next) => handleToggle(slot.id, next)}
                      width={32}
                      height={16}
                      disabled={slot.type === "none"}
                    />
                  </div>
                </div>
                <select
                  className={styles.select}
                  value={slot.type}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(event) => handleTypeChange(slot.id, event.target.value as EffectType)}
                >
                  {EFFECT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions Grid */}
              <div className={styles.actionsGrid}>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(e) => handleMove(slot.id, "up", e)}
                  disabled={index === 0}
                >
                  Up
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(e) => handleMove(slot.id, "down", e)}
                  disabled={index === slots.length - 1}
                >
                  Down
                </button>
                <button
                  type="button"
                  className={styles.actionButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear(slot.id);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Pane: Parameters */}
        <div className={styles.paramPanel}>
          {selectedSlot && selectedSlot.type !== "none" ? (
            <>
              <div className={styles.paramHeader}>
                <Label>{selectedSlot.type.toUpperCase()} PARAMETERS</Label>
              </div>
              <div className={styles.params}>
                {PARAMS_BY_TYPE[selectedSlot.type].map((param) => {
                  const params = selectedSlot.params as Partial<Record<EffectParamKey, number>>;
                  const value = params[param.key] ?? 0;
                  return (
                    <div
                      key={`${selectedSlot.id}-${selectedSlot.type}-${param.key}`}
                      className={styles.param}
                    >
                      <Label>{param.label}</Label>
                      <Knob
                        onChange={(value) => handleParamChange(selectedSlot.id, param.key, value)}
                        defaultValue={value}
                        minValue={param.min}
                        maxValue={param.max}
                        size={60}
                      />
                      <Display parameter={value} className={styles.smallDisplay}></Display>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className={styles.emptyPanel}>
              <Label>NO EFFECT SELECTED</Label>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default InsertFxRack;
