import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AudioEngine, INSERT_FX_WORKLET_URL } from "@/modules/AudioEngine";

type AudioEngineContextValue = {
  engine: AudioEngine;
  isReady: boolean;
  isInitializing: boolean;
  isPowered: boolean;
  fxStatus: "idle" | "loading" | "ready" | "error";
  fxError: string | null;
  setIsPowered: Dispatch<SetStateAction<boolean>>;
  initEngine: () => Promise<void>;
};

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null);

const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
  const engineRef = useRef(new AudioEngine());
  const [isReady, setIsReady] = useState(engineRef.current.isInitialized());
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPowered, setIsPowered] = useState(false);
  const [fxStatus, setFxStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [fxError, setFxError] = useState<string | null>(null);
  const initPromiseRef = useRef<Promise<void> | null>(null);
  const workletPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    engineRef.current.setInsertFxStatusListener((status) => {
      if (status.type === "ready") {
        setFxStatus("ready");
        setFxError(null);
        return;
      }
      if (status.type === "error") {
        setFxStatus("error");
        setFxError(status.message ?? "Insert FX worklet error.");
      }
    });
    return () => {
      void engineRef.current.dispose();
    };
  }, []);

  const loadInsertFxWorklet = useCallback(async () => {
    if (workletPromiseRef.current) {
      await workletPromiseRef.current;
      return;
    }
    const wasmUrl = `${import.meta.env.BASE_URL}wasm/insert_fx.wasm`;
    workletPromiseRef.current = (async () => {
      setFxStatus("loading");
      setFxError(null);
      try {
        const response = await fetch(wasmUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch WASM: ${response.status}`);
        }
        const wasmBytes = await response.arrayBuffer();
        await engineRef.current.loadWorklet(INSERT_FX_WORKLET_URL, wasmBytes);
      } catch (error) {
        setFxStatus("error");
        console.error("Insert FX worklet load failed.", error);
        if (error instanceof Error) {
          setFxError(error.message);
        } else {
          setFxError("Insert FX worklet load failed.");
        }
      }
    })();
    await workletPromiseRef.current;
  }, []);

  const initEngine = useCallback(async () => {
    if (engineRef.current.isInitialized()) {
      return;
    }
    if (!initPromiseRef.current) {
      setIsInitializing(true);
      initPromiseRef.current = engineRef.current
        .init()
        .then(async () => {
          await loadInsertFxWorklet();
          setIsReady(true);
        })
        .finally(() => {
          setIsInitializing(false);
          initPromiseRef.current = null;
        });
    }
    await initPromiseRef.current;
  }, []);

  const value = useMemo(
    () => ({
      engine: engineRef.current,
      isReady,
      isInitializing,
      isPowered,
      fxStatus,
      fxError,
      setIsPowered,
      initEngine,
    }),
    [fxError, fxStatus, initEngine, isInitializing, isPowered, isReady],
  );

  return <AudioEngineContext.Provider value={value}>{children}</AudioEngineContext.Provider>;
};

export const useAudioEngine = () => {
  const context = useContext(AudioEngineContext);
  if (!context) {
    throw new Error("AudioEngineContext is not provided.");
  }
  return context;
};

export default AudioEngineProvider;
