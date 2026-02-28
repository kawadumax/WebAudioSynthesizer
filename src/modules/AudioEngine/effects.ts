export type EffectType = "none" | "distortion" | "delay" | "reverb" | "tremolo";

export type EffectParamsMap = {
  none: Record<string, never>;
  distortion: { drive: number; tone: number; mix: number };
  delay: { time: number; feedback: number; mix: number };
  reverb: { room: number; damping: number; mix: number };
  tremolo: { rate: number; depth: number; mix: number };
};

export type EffectSlot<T extends EffectType = EffectType> = {
  id: string;
  type: T;
  enabled: boolean;
  params: EffectParamsMap[T];
  collapsed: boolean;
};

export type EffectParamKey =
  | keyof EffectParamsMap["distortion"]
  | keyof EffectParamsMap["delay"]
  | keyof EffectParamsMap["reverb"]
  | keyof EffectParamsMap["tremolo"];

export const DEFAULT_EFFECT_PARAMS: { [K in EffectType]: EffectParamsMap[K] } = {
  none: {},
  distortion: { drive: 0.3, tone: 0.5, mix: 0.5 },
  delay: { time: 0.25, feedback: 0.35, mix: 0.4 },
  reverb: { room: 0.5, damping: 0.5, mix: 0.4 },
  tremolo: { rate: 1, depth: 0.5, mix: 1 },
};

export const createEffectSlot = <T extends EffectType>(
  id: string,
  type: T,
  overrides: Partial<EffectParamsMap[T]> = {},
): EffectSlot<T> => {
  const params = { ...DEFAULT_EFFECT_PARAMS[type], ...overrides } as EffectParamsMap[T];
  const enabled = type !== "none";
  const collapsed = type === "none";
  return { id, type, enabled, params, collapsed };
};
