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
import { AudioEngine } from "@/modules/AudioEngine";

type AudioEngineContextValue = {
  engine: AudioEngine;
  isReady: boolean;
  isInitializing: boolean;
  isPowered: boolean;
  setIsPowered: Dispatch<SetStateAction<boolean>>;
  initEngine: () => Promise<void>;
};

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null);

const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
  const engineRef = useRef(new AudioEngine());
  const [isReady, setIsReady] = useState(engineRef.current.isInitialized());
  const [isInitializing, setIsInitializing] = useState(false);
  const [isPowered, setIsPowered] = useState(false);
  const initPromiseRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    return () => {
      void engineRef.current.dispose();
    };
  }, []);

  const initEngine = useCallback(async () => {
    if (engineRef.current.isInitialized()) {
      return;
    }
    if (!initPromiseRef.current) {
      setIsInitializing(true);
      initPromiseRef.current = engineRef.current
        .init()
        .then(() => {
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
      setIsPowered,
      initEngine,
    }),
    [initEngine, isInitializing, isPowered, isReady],
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
