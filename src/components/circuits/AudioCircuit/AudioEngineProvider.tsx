import type { ReactNode } from "react";
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
  initEngine: () => Promise<void>;
};

const AudioEngineContext = createContext<AudioEngineContextValue | null>(null);

const AudioEngineProvider = ({ children }: { children: ReactNode }) => {
  const engineRef = useRef(new AudioEngine());
  const [isReady, setIsReady] = useState(engineRef.current.isInitialized());

  useEffect(() => {
    return () => {
      void engineRef.current.dispose();
    };
  }, []);

  const initEngine = useCallback(async () => {
    if (!engineRef.current.isInitialized()) {
      await engineRef.current.init();
      setIsReady(true);
    }
  }, []);

  const value = useMemo(
    () => ({
      engine: engineRef.current,
      isReady,
      initEngine,
    }),
    [initEngine, isReady],
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
